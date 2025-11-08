import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { FormData, GeneratedSection, GroundingSource } from "../types";
import { ARABIC_SUBJECTS } from "../constants";

let ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// NEW: Retry logic for API calls to handle transient errors like 503s.
async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000 // Start with a 2-second delay
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (attempt === maxRetries) {
        console.error(`API call failed after ${maxRetries} retries.`, error);
        throw error;
      }

      const errorMessage = error.toString();
      // Check for common transient error messages
      const isRetryable = errorMessage.includes('503') || 
                          errorMessage.includes('UNAVAILABLE') || 
                          errorMessage.includes('overloaded') ||
                          errorMessage.includes('timed out');
      
      if (isRetryable) {
        // Use exponential backoff with jitter to prevent thundering herd
        const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`API call failed. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt + 1}/${maxRetries})`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For non-retryable errors, fail fast
        throw error;
      }
    }
  }
  // This line should not be reachable, but is a fallback.
  throw new Error("Max retries reached. Could not complete the API call.");
}

// Fix: Export function to re-initialize the GoogleGenAI client, used for API key selection in VideoLab.
export const reinitializeGoogleGenAI = () => {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// FIX: Corrected typo `Uint8A rray` to `Uint8Array`. This fixes both reported errors.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const parseAndCleanJson = (text: string): { title: string; content: string }[] => {
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1) {
        console.warn("Could not find JSON array, treating entire output as one section.");
        const cleanedText = text.replace(/.*```json/s, '').replace(/```/g, '').trim();
        try {
            const parsed = JSON.parse(cleanedText);
            if(Array.isArray(parsed)) return parsed;
            if(typeof parsed === 'object' && parsed !== null && parsed.title && parsed.content) return [parsed];
        } catch (e) {
             return [{ title: "Konten Dihasilkan", content: cleanedText.replace(/.*```html/s, '').replace(/```/g, '').trim() }];
        }
        return [{ title: "Konten Dihasilkan", content: cleanedText }];
    }
    const jsonString = text.substring(startIndex, endIndex + 1);
    try {
        const parsed = JSON.parse(jsonString);
        if (Array.isArray(parsed) && parsed.every(item => typeof item.title === 'string' && typeof item.content === 'string')) {
            return parsed;
        }
        throw new Error("Parsed JSON is not in the expected format of {title, content}[].");
    } catch (e) {
        console.error("Failed to parse AI response as JSON.", e);
        return [{ title: "Konten (Gagal Parsing)", content: `<p>Gagal mem-parsing respons dari AI. Coba generate ulang.</p><pre>${jsonString}</pre>` }];
    }
};

// Helper function to build the teacher signature block
const buildSignatureBlockHtml = (teacherName: string): string => {
    return `
        <br><br><br>
        <table style="width: 100%; border-collapse: collapse; border: none; font-size: 12pt;">
            <tbody>
                <tr>
                    <td style="width: 65%; border: none;"></td>
                    <td style="width: 35%; border: none; text-align: left; padding: 5px;">
                        Bogor, ............................................<br>
                        Guru Mata Pelajaran,
                        <br><br><br><br><br>
                        <b style="text-decoration: underline;">${teacherName || '............................................'}</b>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
};

export const getCPSuggestions = async (formData: Partial<FormData>): Promise<string> => {
    const topicInstruction = formData.cp_elements ? `- Bab / Topik: ${formData.cp_elements}` : `PENTING: Karena tidak ada Bab/Topik spesifik yang diberikan, buatlah saran Elemen CP yang bersifat umum dan fundamental untuk mata pelajaran ini di kelas tersebut.`;
    const prompt = `Anda adalah asisten ahli kurikulum. Berdasarkan informasi berikut:\n- Jenjang: ${formData.jenjang}\n- Kelas: ${formData.kelas}\n- Mata Pelajaran: ${formData.mata_pelajaran}\n${topicInstruction}\n\nBuatkan 5 saran Elemen Capaian Pembelajaran (CP) yang relevan. Format output HARUS berupa satu string Markdown dengan daftar bernomor (contoh: 1. ...\\n2. ...). JANGAN gunakan format JSON.`;
    
    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    const response = await withRetry(apiCall) as GenerateContentResponse;
    return response.text;
};

export const getTopicSuggestions = async (formData: Partial<FormData>): Promise<string> => {
    const prompt = `Berdasarkan informasi berikut:\n- Jenjang: ${formData.jenjang}\n- Kelas: ${formData.kelas}\n- Mata Pelajaran: ${formData.mata_pelajaran}\n\nBuatkan 3 sampai 5 saran Topik/Materi yang terstruktur untuk bank soal. Format output HARUS berupa satu string Markdown.`;
    const apiCall = () => ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    // FIX: Cast response to GenerateContentResponse to fix TypeScript error.
    const response = await withRetry(apiCall) as GenerateContentResponse;
    return response.text;
};


// --- Grounded Search Service ---
export const groundedSearch = async (
    query: string, 
    tool: 'web' | 'maps', 
    location?: { latitude: number; longitude: number }
): Promise<{ text: string; sources: GroundingSource[] }> => {
    const config: any = {
        tools: tool === 'web' ? [{ googleSearch: {} }] : [{ googleMaps: {} }],
    };
    if (tool === 'maps' && location) {
        config.toolConfig = { retrievalConfig: { latLng: location } };
    }

    const apiCall = () => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: config,
    });
    const response: GenerateContentResponse = await withRetry(apiCall);
    
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = rawChunks.map(chunk => {
        if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
        if (chunk.maps) return { uri: chunk.maps.uri, title: chunk.maps.title, ...chunk.maps };
        return { uri: '', title: 'Unknown Source' };
    }).filter(source => source.uri);

    return { text: response.text, sources };
};

// --- TTS Service ---
export const textToSpeech = async (text: string): Promise<AudioBuffer> => {
    const apiCall = () => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
    });
    // FIX: Cast response to GenerateContentResponse to fix TypeScript error.
    const response = await withRetry(apiCall) as GenerateContentResponse;
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
        return audioBuffer;
    }
    throw new Error("TTS generation failed.");
};

// Fix: Export functions for ImageLab component.
// --- Image Lab Services ---
export const generateImage = async (prompt: string): Promise<string> => {
    const apiCall = () => ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });
    // FIX: Cast response to the expected shape to fix TypeScript error.
    const response = await withRetry(apiCall) as { generatedImages: { image: { imageBytes: string } }[] };
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    // FIX: Cast response to GenerateContentResponse to fix TypeScript error.
    const response = await withRetry(apiCall) as GenerateContentResponse;
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("Image editing failed to produce an image.");
};

export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: base64ImageData,
        },
    };
    const textPart = {
        text: prompt,
    };
    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    // FIX: Cast response to GenerateContentResponse to fix TypeScript error.
    const response = await withRetry(apiCall) as GenerateContentResponse;
    return response.text;
};

// Fix: Export functions for VideoLab component.
// --- Video Lab Services ---
export const generateVideo = async (
    prompt: string,
    image: { imageBytes: string; mimeType: string } | null,
    aspectRatio: '16:9' | '9:16'
): Promise<any> => {
    const apiCall = () => ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: image || undefined,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });
    const operation = await withRetry(apiCall);
    return operation;
};

export const checkVideoOperation = async (operation: any): Promise<any> => {
    const apiCall = () => ai.operations.getVideosOperation({ operation: operation });
    return await withRetry(apiCall, 3, 1000); // Shorter delay for status checks
};

export const analyzeVideoFrames = async (
    frames: { data: string; mimeType: string }[],
    prompt: string
): Promise<string> => {
    const imageParts = frames.map(frame => ({
        inlineData: {
            data: frame.data,
            mimeType: frame.mimeType,
        },
    }));
    
    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { 
            parts: [
                ...imageParts,
                { text: "These are frames from a video. " + prompt },
            ],
        },
    });
    // FIX: Cast response to GenerateContentResponse to fix TypeScript error.
    const response = await withRetry(apiCall) as GenerateContentResponse;
    return response.text;
};


// --- Existing Services (Updated) ---
export const generateAdminContent = async (formData: FormData): Promise<GeneratedSection[]> => {
    const isArabicContext = formData.bahasa === 'Bahasa Arab' || ARABIC_SUBJECTS.includes(formData.mata_pelajaran.toUpperCase().replace(/'|\\/g, ''));
    const arabicInstructions = isArabicContext 
        ? `INSTRUKSI UTAMA: UNTUK MATA PELAJARAN INI, SEMUA KONTEN YANG DIHASILKAN (TERMASUK JUDUL DAN ISI DALAM JSON) WAJIB 100% DALAM BAHASA ARAB FUSHA (Standard Arabic). Semua teks Arab WAJIB ditulis dengan harakat (tashkeel) yang lengkap dan benar. Gunakan angka India (١, ٢, ٣) untuk semua penomoran.` 
        : '';
    const numModulAjar = formData.jumlah_modul_ajar || 1;
    const modulAjarInstructions = `- ${numModulAjar} buah elemen JSON untuk "Modul Ajar". Beri judul "Modul Ajar 1", "Modul Ajar 2", dst. Pastikan setiap modul ajar memiliki konten yang unik dan relevan.`;
    const language = isArabicContext ? 'Bahasa Arab' : formData.bahasa;

    const prompt = `Anda adalah asisten ahli untuk guru di Indonesia (Kurikulum Merdeka). Buat dokumen administrasi dalam BAHASA YANG DIMINTA. ${arabicInstructions} Output HARUS berupa array JSON valid { "title": "...", "content": "..." }.

INSTRUKSI FORMAT KONTEN:
1.  **Dokumen Tabular (ATP, Prota, Promes, KKTP, Jurnal):** Isi "content" WAJIB berupa SATU TABEL HTML UTAMA (<table style="width:100%; border-collapse: collapse;">). Semua sel (<td>, <th>) harus memiliki border: style="border: 1px solid black; padding: 5px;". JANGAN ada elemen lain (seperti <p> atau <h2>) di luar tabel ini. Promes HARUS mencakup detail 6 bulan untuk semester ${formData.semester} (${formData.semester === '1' ? 'Juli-Des' : 'Jan-Jun'}).
2.  **Dokumen Tekstual (Modul Ajar):** Isi "content" HARUS berupa dokumen HTML terstruktur menggunakan heading (<h3>, <h4>), paragraf (<p>), dan list (<ul>/<ol>). JANGAN bungkus seluruh konten Modul Ajar dalam satu tag <table>.
3.  **Materi Pembelajaran (PPT):** Gunakan struktur <div class="ppt-container">...</div> seperti yang diinstruksikan sebelumnya. JANGAN gunakan tabel untuk layout slide.

Buat elemen JSON untuk: "Materi Pembelajaran (PPT)", "Alur Tujuan Pembelajaran (ATP)", "Program Tahunan (Prota)", "Program Semester (Promes)", ${modulAjarInstructions}, "Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)", dan "Jurnal Harian Mengajar".

Data: Jenjang: ${formData.jenjang}, Kelas: ${formData.kelas}, Semester: ${formData.semester} (${formData.semester === '1' ? 'Ganjil' : 'Genap'}), Mapel: ${formData.mata_pelajaran}, Sekolah: ${formData.sekolah}, Tahun Ajaran: ${formData.tahun_ajaran}, Guru: ${formData.nama_guru}, Fase: ${formData.fase}, CP: ${formData.cp_elements}, Alokasi Waktu: ${formData.alokasi_waktu}, Bahasa: ${language}.

ATURAN PENTING:
- Konten WAJIB fokus pada CP dan materi yang relevan untuk semester yang ditentukan.
- Di akhir KONTEN SETIAP DOKUMEN, SETELAH tag penutup utama (</table> atau </div>), WAJIB tambahkan blok tanda tangan guru dengan format: '<br><br><br><table style="width: 100%; border: none; font-size: 12pt;"><tbody><tr><td style="width: 65%; border: none;"></td><td style="width: 35%; border: none; text-align: left;">Bogor, ............................................<br>Guru Mata Pelajaran,<br><br><br><br><br><b style="text-decoration: underline;">${formData.nama_guru}</b></td></tr></tbody></table>'.`;

    const modelConfig: any = {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "content"] } }
    };

    if(formData.use_thinking_mode) {
        modelConfig.thinkingConfig = { thinkingBudget: 32768 };
    }

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: modelConfig,
    });

    // FIX: Cast response to GenerateContentResponse to fix TypeScript error.
    const response = await withRetry(apiCall) as GenerateContentResponse;
    
    const sections = parseAndCleanJson(response.text);
    return sections.map((section, index) => ({ ...section, id: `${Date.now()}-${index}` }));
};

const buildSoalHeaderHtml = (formData: FormData): string => {
    const { yayasan, sekolah, alamat_sekolah, logo_sekolah, judul_asesmen, tahun_ajaran, kelas, mata_pelajaran, tanggal_ujian, jam_ke, waktu_ujian } = formData;
    const logoHtml = logo_sekolah ? `<img src="${logo_sekolah}" style="width: 80px; height: auto; max-height: 80px; object-fit: contain;" alt="Logo Sekolah">` : '&nbsp;';
    
    return `<div style="font-family: 'Times New Roman', serif; margin-bottom: 20px;">
        <table style="width: 100%; border: 1px solid black; border-collapse: collapse;">
            <!-- Row for Logo and School Info -->
            <tr>
                <td style="width: 20%; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 10px;">
                    ${logoHtml}
                </td>
                <td style="width: 80%; text-align: center; vertical-align: middle; padding: 10px;">
                    <div style="font-weight: bold; font-size: 14pt; text-transform: uppercase;">${yayasan || 'YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI'}</div>
                    <div style="font-weight: bold; font-size: 15pt; text-transform: uppercase;">${sekolah || 'SEKOLAH MENENGAH ATAS (SMA) ISLAM AL-GHOZALI'}</div>
                    <div style="font-size: 10pt;">${alamat_sekolah || 'Jl. Permata No. 19 Curug Gunungsindur Kab. Bogor 16340'}</div>
                </td>
            </tr>
            <!-- Row for Assessment Title -->
            <tr style="border-top: 1px solid black; border-bottom: 1px solid black;">
                <td colspan="2" style="text-align: center; padding: 5px;">
                    <div style="font-weight: bold; font-size: 12pt; text-transform: uppercase;">${judul_asesmen || 'PENILAIAN SUMATIF AKHIR SEMESTER GANJIL'}</div>
                    <div style="font-weight: bold; font-size: 12pt; text-transform: uppercase;">TAHUN PELAJARAN ${tahun_ajaran || '2025-2026'}</div>
                </td>
            </tr>
            <!-- Row for Metadata -->
            <tr>
                <td colspan="2" style="padding: 5px;">
                    <table style="width: 100%; font-size: 11pt; border-collapse: collapse;">
                        <tbody>
                            <tr>
                                <td style="width: 15%; padding: 2px;">Mata Pelajaran</td>
                                <td style="width: 35%; padding: 2px;">: ${mata_pelajaran || ''}</td>
                                <td style="width: 15%; padding: 2px;">Hari/Tanggal</td>
                                <td style="width: 35%; padding: 2px;">: ${tanggal_ujian || '...................'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 2px;">Kelas</td>
                                <td style="padding: 2px;">: ${kelas || ''}</td>
                                <td style="padding: 2px;">Jam Ke-</td>
                                <td style="padding: 2px;">: ${jam_ke || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 2px;">Waktu</td>
                                <td style="padding: 2px;">: ${waktu_ujian || ''}</td>
                                <td style="padding: 2px;">&nbsp;</td>
                                <td style="padding: 2px;">&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>
    </div>`;
};


export const generateSoalContentSections = async (formData: FormData): Promise<GeneratedSection[]> => {
    const { jenis_soal, jumlah_pg, jumlah_uraian, jumlah_isian_singkat, sertakan_kisi_kisi, sertakan_soal_tka, jumlah_soal_tka, kelompok_tka } = formData;
    const isPesantren = formData.jenjang === 'Pesantren';
    const isArabicContext = formData.bahasa === 'Bahasa Arab' || ARABIC_SUBJECTS.includes(formData.mata_pelajaran.toUpperCase().replace(/'|\\/g, ''));
    const arabicInstructions = isArabicContext 
        ? `INSTRUKSI UTAMA: UNTUK MATA PELAJARAN INI, SELURUH NASKAH UJIAN DAN PERANGKATNYA (TERMASUK JUDUL DAN ISI DALAM JSON) WAJIB 100% DALAM BAHASA ARAB FUSHA (Standard Arabic). Semua teks Arab WAJIB ditulis dengan harakat (tashkeel) yang lengkap dan benar. Gunakan angka India (١, ٢, ٣) untuk semua penomoran, termasuk nomor soal.` 
        : '';
    const language = isArabicContext ? 'Bahasa Arab' : formData.bahasa;
        
    // Standard question type checks
    const hasPG = jenis_soal?.includes('Pilihan Ganda');
    const hasUraian = jenis_soal?.includes('Uraian');
    const hasIsianSingkat = jenis_soal?.includes('Isian Singkat');
    const addTKA = sertakan_soal_tka && jumlah_soal_tka && jumlah_soal_tka > 0 && kelompok_tka;

    // Pesantren question type checks
    const hasAlif = isPesantren && formData.jenis_soal_pesantren?.includes('Alif');
    const hasBa = isPesantren && formData.jenis_soal_pesantren?.includes('Ba');
    const hasJim = isPesantren && formData.jenis_soal_pesantren?.includes('Jim');
    const hasDal = isPesantren && formData.jenis_soal_pesantren?.includes('Dal');
    const hasHa = isPesantren && formData.mata_pelajaran.toUpperCase() === 'INSYA' && formData.jenis_soal_pesantren?.includes('Ha');

    let sectionCounter = 0;
    const getSectionLetter = (isPesantrenContext: boolean) => {
        if (isPesantrenContext) {
            const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ'];
            return arabicLetters[sectionCounter++];
        }
        return String.fromCharCode('A'.charCodeAt(0) + sectionCounter++);
    };
    
    let formatInstructions = `
- PENTING: JANGAN BUAT header ujian (seperti kop surat, judul ujian, mata pelajaran, dll.) di dalam konten HTML. Header akan ditambahkan secara otomatis. Langsung mulai dengan baris heading bagian soal.
- Konten "Naskah Soal" HARUS dibungkus dalam SATU TABEL HTML UTAMA (<table style="width:100%; border: 1px solid black; border-collapse: collapse;">) dengan 2 kolom (No dan Soal). Setiap baris (<tr>) adalah satu soal atau satu heading bagian. Pastikan semua sel (<td>) memiliki border: style="border: 1px solid black; padding: 5px;".
- Kolom "No" (lebar sekitar 5%) berisi nomor soal, dengan vertical-align: top. Kolom "Soal" berisi teks soal.
- Lanjutkan penomoran soal secara berurutan di semua bagian.
- PASTIKAN HANYA ADA SATU TAG <table> PEMBUKA DAN SATU TAG </table> PENUTUP UNTUK SELURUH NASKAH SOAL.
    `;

    if (isPesantren) {
        const pesantrenQuestionTypes = {
            'Alif': { title: 'إِكْمَالُ الْفَرَاغِ', instruction: 'أَكْمِلِ الْفَرَاغَ بِالْكَلِمَةِ الْمُنَاسِبَةِ!', task: (count: number) => `Buat ${count} soal isian singkat (fill-in-the-blanks). Soal harus berupa kalimat yang belum lengkap.` },
            'Ba': { title: 'أَسْئِلَةٌ مَقَالِيَّةٌ', instruction: 'أَجِبْ عَنِ الْأَسْئِلَةِ التَّالِيَةِ إِجَابَةً صَحِيْحَةً!', task: (count: number) => `Buat ${count} soal pertanyaan singkat yang membutuhkan jawaban beberapa kalimat (esai singkat).` },
            'Jim': { title: 'تَكْوِيْنُ الْجُمَلِ', instruction: 'كَوِّنْ جُمَلًا مُفِيْدَةً مِنَ الْكَلِمَاتِ التَّالِيَةِ!', task: (count: number) => `Buat ${count} soal di mana siswa diminta membuat kalimat sempurna dari kata kunci yang diberikan.` },
            'Dal': { title: 'التَّرْجَمَةُ', instruction: 'تَرْجِمِ الْجُمَلَ التَّالِيَةَ إِلَى اللُّغَةِ الْعَرَبِيَّةِ!', task: (count: number) => `Buat ${count} soal terjemahan dari Bahasa Indonesia ke Bahasa Arab.` },
            'Ha': { title: 'الْإِنْشَاءُ', instruction: 'اُكْتُبْ فِقْرَةً كَامِلَةً عَنِ الْمَوْضُوْعِ التَّالِي!', task: (count: number) => `Buat ${count} soal karangan (insya) dengan memberikan satu tema untuk dikembangkan.` }
        };
        
        let pesantrenInstructions = '';
        const addPesantrenSection = (type: keyof typeof pesantrenQuestionTypes, count?: number) => {
            if (count && count > 0) {
                const details = pesantrenQuestionTypes[type];
                const sectionHeader = `<tr><td colspan="2" style="border: 1px solid black; padding: 5px; background-color: #f2f2f2; text-align: right;"><b>${getSectionLetter(true)}. ${details.title}</b></td></tr>`;
                const instructionRow = `<tr><td colspan="2" style="border: 1px solid black; padding: 5px; text-align: right;"><i>${details.instruction}</i></td></tr>`;
                pesantrenInstructions += `- **Bagian ${type}**: Mulai dengan baris heading '${sectionHeader}', diikuti baris instruksi '${instructionRow}'. ${details.task(count)}\n`;
            }
        };

        if (hasAlif) addPesantrenSection('Alif', formData.jumlah_soal_alif);
        if (hasBa) addPesantrenSection('Ba', formData.jumlah_soal_ba);
        if (hasJim) addPesantrenSection('Jim', formData.jumlah_soal_jim);
        if (hasDal) addPesantrenSection('Dal', formData.jumlah_soal_dal);
        if (hasHa) addPesantrenSection('Ha', formData.jumlah_soal_ha);

        formatInstructions += pesantrenInstructions;
    } else {
        let mcOptionsInstruction = '';
        if (['SD', 'MI'].includes(formData.jenjang)) mcOptionsInstruction = 'Pilihan ganda HARUS memiliki 3 opsi (A, B, C).';
        else if (['SMP', 'MTS'].includes(formData.jenjang)) mcOptionsInstruction = 'Pilihan ganda HARUS memiliki 4 opsi (A, B, C, D).';
        else if (['SMA', 'MA'].includes(formData.jenjang)) mcOptionsInstruction = 'Pilihan ganda HARUS memiliki 5 opsi (A, B, C, D, E).';
        
        const pgInstruction = `<tr><td colspan="2" style="border: 1px solid black; padding: 5px;"><i>Berilah tanda silang (X) pada huruf A, B, C, D atau E pada jawaban yang benar!</i></td></tr>`;
        const uraianInstruction = `<tr><td colspan="2" style="border: 1px solid black; padding: 5px;"><i>JAWABLAH PERTANYAAN BERIKUT INI DENGAN TEPAT, SINGKAT DAN BENAR!</i></td></tr>`;
        const isianInstruction = `<tr><td colspan="2" style="border: 1px solid black; padding: 5px;"><i>ISILAH TITIK-TITIK DI BAWAH INI DENGAN JAWABAN YANG SINGKAT DAN TEPAT!</i></td></tr>`;

        if (hasPG) formatInstructions += `- **Bagian PG**: Mulai dengan baris heading (<td colspan="2" style="border: 1px solid black; padding: 5px; background-color: #f2f2f2;"><b>${getSectionLetter(false)}. PILIHAN GANDA</b></td>), diikuti baris instruksi '${pgInstruction}'. Buat ${jumlah_pg} soal PG. ${mcOptionsInstruction} Gunakan format <ol type="A"> untuk opsi jawaban.\n`;
        if (addTKA) formatInstructions += `- **Bagian TKA**: Setelah PG, tambahkan baris heading (<td colspan="2" style="border: 1px solid black; padding: 5px; background-color: #f2f2f2;"><b>${getSectionLetter(false)}. SOAL TAMBAHAN (MODEL TKA-UTBK)</b></td>), diikuti baris instruksi '${pgInstruction}'. Buat ${jumlah_soal_tka} soal PG TKA.\n`;
        if (hasUraian) formatInstructions += `- **Bagian Uraian**: Setelah bagian sebelumnya, tambahkan baris heading (<td colspan="2" style="border: 1px solid black; padding: 5px; background-color: #f2f2f2;"><b>${getSectionLetter(false)}. URAIAN</b></td>), diikuti baris instruksi '${uraianInstruction}'. Buat ${jumlah_uraian} soal uraian.\n`;
        if (hasIsianSingkat) formatInstructions += `- **Bagian Isian Singkat**: Setelah bagian sebelumnya, tambahkan baris heading (<td colspan="2" style="border: 1px solid black; padding: 5px; background-color: #f2f2f2;"><b>${getSectionLetter(false)}. ISIAN SINGKAT</b></td>), diikuti baris instruksi '${isianInstruction}'. Buat ${jumlah_isian_singkat} soal isian.\n`;
    }

    // Build the list of required sections dynamically and cleanly
    const requiredSections = [];
    if (sertakan_kisi_kisi) {
        requiredSections.push(`- Satu elemen JSON dengan title "Kisi-kisi Soal". Kontennya WAJIB berupa SATU TABEL HTML (<table style="width: 100%; border-collapse: collapse;">) yang rapi dengan sel (<td>, <th>) yang memiliki style="border: 1px solid black; padding: 5px; text-align: left; vertical-align: top;">. Kolomnya: No, Kompetensi/Tujuan, Materi, Indikator, Level Kognitif, Bentuk Soal, dan Nomor Soal.`);
    }
    requiredSections.push(`- Satu elemen JSON dengan title "Naskah Soal". Ini adalah bagian UTAMA.`);
    requiredSections.push(`- WAJIB SATU elemen JSON untuk "Kunci Jawaban dan Pedoman Penskoran". Gunakan heading (<h3>, <h4>) dan list (<ol>, <ul>) untuk bagian ini, JANGAN gunakan tabel. Konten harus punya sub-heading untuk setiap jenis soal, pembahasan singkat PG, rubrik esai, dan pedoman skor total.`);
    requiredSections.push(`- Satu elemen JSON dengan title "Analisis Kualitatif Soal". Kontennya WAJIB berisi DUA TABEL HTML terpisah (satu untuk Pilihan Ganda, satu untuk Uraian/Isian Singkat). Setiap tabel HARUS memiliki kolom: "No. Soal", "Aspek yang Dianalisis" (sub-baris untuk Materi, Konstruksi, Bahasa), dan "Keterangan/Catatan" (apakah soal sudah baik atau perlu perbaikan).`);
    const requiredSectionsPrompt = requiredSections.join('\n');

    const tkaPromptPart = addTKA ? `INSTRUKSI SOAL TAMBAHAN (MODEL TKA): Setelah soal PG standar, tambahkan ${jumlah_soal_tka} soal PG HOTS gaya TKA-UTBK ${kelompok_tka?.toUpperCase()}. Materi tetap relevan. Lanjutkan penomoran. Soal TKA ini juga HARUS mengikuti aturan jumlah opsi jawaban yang sama dengan soal PG standar. Pastikan formatnya rapi dan konsisten di dalam tabel utama.` : '';
    
    const contentPrompt = `Anda AI ahli asesmen Kurikulum Merdeka. Buat bagian naskah ujian dalam BAHASA YANG DIMINTA. ${arabicInstructions} Output HARUS array JSON valid { "title": "...", "content": "..." }.

BAGIAN-BAGIAN YANG WAJIB DIBUAT:
${requiredSectionsPrompt}

DETAIL UJIAN: Jenjang: ${formData.jenjang}, Kelas: ${formData.kelas}, Semester: ${formData.semester} (${formData.semester === '1' ? 'Ganjil' : 'Genap'}), Mapel: ${formData.mata_pelajaran}, Topik: ${formData.topik_materi}, Kesulitan: ${formData.tingkat_kesulitan}, Bahasa: ${language}.

ATURAN KONTEN: Semua soal WAJIB berfokus pada "Topik/Materi" yang relevan untuk semester yang ditentukan. Pastikan setiap soal unik dan tidak ada duplikasi. ${isPesantren ? 'UNTUK PESANTREN, JANGAN PERNAH MEMBUAT SOAL PILIHAN GANDA (A, B, C, D, E).' : tkaPromptPart}.

ATURAN FORMAT UNTUK "Naskah Soal":
${formatInstructions}`;
    
    const modelConfig: any = {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "content"] } }
    };
    
    if (formData.use_thinking_mode) {
        modelConfig.thinkingConfig = { thinkingBudget: 32768 };
    }

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contentPrompt,
        config: modelConfig,
    });

    const response = await withRetry(apiCall) as GenerateContentResponse;

    const sections = parseAndCleanJson(response.text);
    const signatureHtml = buildSignatureBlockHtml(formData.nama_guru);
    const naskahSoalTitles = ['Naskah Soal', 'النص الكامل للأسئلة'];

    const finalSections = sections.map(section => {
        if (naskahSoalTitles.includes(section.title)) {
            // This is the question sheet, only add the header.
            return {
                ...section,
                content: buildSoalHeaderHtml(formData) + section.content
            };
        } else {
            // For all other sections (Kisi-kisi, Kunci Jawaban, etc.), add the signature.
            return {
                ...section,
                content: section.content + signatureHtml
            };
        }
    });
    
    return finalSections.map((section, index) => ({ ...section, id: `${Date.now()}-${index}` }));
};