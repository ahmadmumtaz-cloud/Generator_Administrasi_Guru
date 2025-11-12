
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { FormData, GeneratedSection, GroundingSource } from "../types";
import { ARABIC_SUBJECTS } from "../constants";

let ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// NEW: Base64 encoded image for the Pesantren exam header
const PESANTREN_HEADER_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAADIBAMAAABN/C3bAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJUExURQAAABRFFBRAFA232JIAAAABdFJOUwBA5thmAAADOUlEQVR42u3bQXLCQBSA4c9/d8gBQXKBEa5AnXv0/29AEEj20sDsfm0rAAAAAADgC4Xn9drPa55A2Z/XfK75hR8AAMAfGk5QsoToitQf/f6g7g8EAAAA/BdhA8QGEJvFbv/m9QTm5QIAAAAAgGlhAcQGEBsAANBkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkqwBiA4gNAADg5d4FiA0gNoAAgHawAUQGEBsAANCkq';

// Define a reusable schema for structured JSON output to improve reliability
const sectionsSchema = {
    type: Type.OBJECT,
    properties: {
        sections: {
            type: Type.ARRAY,
            description: "An array of generated document sections.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Unique identifier for the section (e.g., 'atp', 'naskah_soal')." },
                    title: { type: Type.STRING, description: "The title of the generated section." },
                    content: { type: Type.STRING, description: "The full HTML content of the section." },
                },
                required: ['id', 'title', 'content'],
            },
        },
    },
    required: ['sections'],
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0) {
            console.warn(`Retrying... attempts left: ${retries}`);
            await new Promise(res => setTimeout(res, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const reinitializeGoogleGenAI = () => {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getCPSuggestions = async (formData: Partial<FormData>): Promise<string> => {
    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Buat daftar Elemen Capaian Pembelajaran (CP) untuk mata pelajaran ${formData.mata_pelajaran}, jenjang ${formData.jenjang}, kelas ${formData.kelas}, fase ${formData.fase}. Sajikan dalam format Markdown dengan poin-poin.`,
    });
    return response.text;
};

export const getTopicSuggestions = async (formData: Partial<FormData>): Promise<string> => {
    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Berikan daftar ide Topik/Materi Pembelajaran yang relevan untuk mata pelajaran ${formData.mata_pelajaran}, jenjang ${formData.jenjang}, kelas ${formData.kelas}, fase ${formData.fase} untuk semester ${formData.semester}. Sajikan dalam format Markdown dengan poin-poin.`,
    });
    return response.text;
};

export const generateAdminContent = async (formData: FormData): Promise<GeneratedSection[]> => {
    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Anda adalah asisten ahli untuk guru di Indonesia. Buatkan dokumen administrasi guru lengkap sesuai Kurikulum Merdeka.
        **Data:**
        - Jenjang: ${formData.jenjang}
        - Kelas: ${formData.kelas}
        - Fase: ${formData.fase}
        - Mata Pelajaran: ${formData.mata_pelajaran}
        - Elemen CP: ${formData.cp_elements}
        - Alokasi Waktu: ${formData.alokasi_waktu}
        - Jumlah Modul Ajar yang dibuat: ${formData.jumlah_modul_ajar}
        - Sekolah: ${formData.sekolah}
        - Guru: ${formData.nama_guru}
        - Tahun Ajaran: ${formData.tahun_ajaran}
        - Semester: ${formData.semester === '1' ? 'Ganjil' : 'Genap'}
        - Bahasa: ${formData.bahasa}
        
        **Tugas:**
        Generate dokumen berikut dalam format JSON. Setiap dokumen harus menjadi objek dalam array 'sections', dengan 'id', 'title', dan 'content' (dalam format HTML).
        1.  **Analisis CP, TP, dan ATP**: Buat tabel ATP yang runut.
        2.  **Program Tahunan (Prota)**: Buat tabel Prota.
        3.  **Program Semester (Promes)**: Buat tabel Promes.
        4.  **${formData.jumlah_modul_ajar} Modul Ajar**: Buat modul ajar lengkap sesuai jumlah yang diminta.
        5.  **KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)**: Buat tabel KKTP.
        6.  **Jurnal Harian Guru**: Buat format tabel jurnal harian yang siap diisi.

        **Aturan Format:**
        - Root object harus memiliki properti "sections" yang berisi array.
        - Setiap objek section harus memiliki: "id" (string unik, misal "atp"), "title" (string, misal "Analisis CP, TP, dan ATP"), "content" (string HTML).
        - Gunakan tag HTML standar untuk format (<table>, <thead>, <tbody>, <tr>, <th>, <td>, <h3>, <p>, <ul>, <li>).
        - Untuk bahasa Arab, gunakan <p style="text-align:right; direction:rtl;">.
        `,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.7,
            ...(formData.use_thinking_mode && { thinkingConfig: { thinkingBudget: 8192 } })
        }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result.sections;
};

export const generateSoalContentSections = async (formData: FormData): Promise<GeneratedSection[]> => {
    const isArabicContext = ARABIC_SUBJECTS.includes(formData.mata_pelajaran.toUpperCase());

    const headerContent = formData.jenjang === 'Pesantren'
        ? `<div style="text-align: center;"><img src="${PESANTREN_HEADER_IMAGE_BASE64}" alt="Kop Surat Pesantren" style="width: 100%; max-width: 700px; margin: 0 auto;"/></div>`
        : `
        <div style="text-align: center; font-family: 'Times New Roman', serif; border-bottom: 3px solid black; padding-bottom: 5px; margin-bottom: 10px;">
            ${formData.logo_sekolah ? `<img src="${formData.logo_sekolah}" alt="logo" style="width: 80px; height: auto; position: absolute; left: 20px;">` : ''}
            <h3 style="margin: 0; font-size: 14pt; font-weight: bold;">${formData.yayasan || ''}</h3>
            <h2 style="margin: 0; font-size: 18pt; font-weight: bold;">${formData.sekolah}</h2>
            <p style="margin: 0; font-size: 10pt;">${formData.alamat_sekolah || ''}</p>
        </div>
        <h3 style="text-align: center; font-family: 'Times New Roman', serif; font-weight: bold; margin-top: 20px;">${formData.judul_asesmen || ''}</h3>
        <table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif; margin-top: 15px; font-size: 11pt;">
            <tbody>
                <tr>
                    <td style="border: none; padding: 2px; width: 15%;">Mata Pelajaran</td>
                    <td style="border: none; padding: 2px; width: 2%;">:</td>
                    <td style="border: none; padding: 2px; width: 33%;">${formData.mata_pelajaran}</td>
                    <td style="border: none; padding: 2px; width: 15%;">Tanggal</td>
                    <td style="border: none; padding: 2px; width: 2%;">:</td>
                    <td style="border: none; padding: 2px; width: 33%;">${formData.tanggal_ujian || ''}</td>
                </tr>
                <tr>
                    <td style="border: none; padding: 2px;">Kelas/Semester</td>
                    <td style="border: none; padding: 2px;">:</td>
                    <td style="border: none; padding: 2px;">${formData.kelas} / ${formData.semester === '1' ? 'Ganjil' : 'Genap'}</td>
                    <td style="border: none; padding: 2px;">Jam Ke-</td>
                    <td style="border: none; padding: 2px;">:</td>
                    <td style="border: none; padding: 2px;">${formData.jam_ke || ''}</td>
                </tr>
                 <tr>
                    <td style="border: none; padding: 2px;">Tahun Ajaran</td>
                    <td style="border: none; padding: 2px;">:</td>
                    <td style="border: none; padding: 2px;">${formData.tahun_ajaran}</td>
                    <td style="border: none; padding: 2px;">Waktu</td>
                    <td style="border: none; padding: 2px;">:</td>
                    <td style="border: none; padding: 2px;">${formData.waktu_ujian || ''}</td>
                </tr>
            </tbody>
        </table>
        `;
    
    const signatureBlock = `
        <div style="margin-top: 40px; overflow: auto;">
            <div style="float: right; text-align: center; width: 250px;">
                <p>Guru Mata Pelajaran</p>
                <br/><br/><br/>
                <p style="font-weight: bold; text-decoration: underline;">${formData.nama_guru}</p>
            </div>
        </div>
    `;

    const sectionsToGenerate = [
        { id: "naskah_soal", title: "Naskah Soal" },
        { id: "kunci_jawaban", title: "Kunci Jawaban & Pembahasan" },
        { id: "analisis_kualitatif", title: "Analisis Soal Kualitatif" },
        { id: "rubrik_penilaian", title: "Rubrik Penilaian" },
        { id: "ringkasan_materi", title: "Ringkasan Materi" },
    ];

    if (formData.sertakan_kisi_kisi) {
        sectionsToGenerate.splice(1, 0, { id: "kisi_kisi", title: "Kisi-kisi Soal" });
    }

    const sectionPrompts = sectionsToGenerate.map((section, index) => {
        let description = '';
        switch (section.id) {
            case 'naskah_soal':
                description = 'Konten naskah soal lengkap sesuai struktur yang diminta.';
                break;
            case 'kisi_kisi':
                description = 'Buat tabel kisi-kisi soal yang mencakup: No, Capaian Pembelajaran, Materi Pokok, Kelas/Semester, Indikator Soal, Level Kognitif (C1-C6), Bentuk Soal, dan Nomor Soal.';
                break;
            case 'kunci_jawaban':
                description = 'Berikan kunci jawaban untuk PG dan Uraian. Yang terpenting, SERTAKAN PEMBAHASAN/PENJELASAN yang detail untuk SETIAP SOAL, agar siswa bisa belajar dari kesalahan.';
                break;
            case 'analisis_kualitatif':
                description = 'Buat analisis kualitatif dalam bentuk tabel. Kolom tabel mencakup: No. Soal, Aspek yang Dianalisis (Materi, Konstruksi, Bahasa), Keterangan (Sesuai/Tidak Sesuai), dan Catatan/Tindak Lanjut. Analisis ini untuk memastikan kualitas soal.';
                break;
            case 'rubrik_penilaian':
                description = 'Buat rubrik penilaian yang jelas. Untuk Pilihan Ganda, berikan skor per soal (misal, skor 1 jika benar, 0 jika salah). Untuk Uraian, buat rubrik penilaian detail per soal dengan kriteria dan rentang skor (contoh: Skor 0-5 berdasarkan ketepatan konsep, kelengkapan jawaban, dan alur berpikir). Sertakan juga pedoman perhitungan nilai akhir.';
                break;
            case 'ringkasan_materi':
                description = 'Buat ringkasan materi yang padat dan jelas dari topik yang diujikan. Ringkasan ini harus membantu siswa mereview materi sebelum ujian.';
                break;
        }
        return `${index + 1}. **${section.title}**: ${description}`;
    }).join('\n');
    
    const pgInstructions = [];
    if (formData.jenis_soal?.includes('Pilihan Ganda') && formData.jumlah_pg > 0) {
        pgInstructions.push(`${formData.jumlah_pg} soal pilihan ganda biasa`);
    }
    if (formData.sertakan_soal_tka && formData.jumlah_soal_tka > 0) {
        pgInstructions.push(`${formData.jumlah_soal_tka} soal Pilihan Ganda level TKA (${formData.kelompok_tka})`);
    }

    const uraianInstructions = [];
    if (formData.jenis_soal?.includes('Uraian') && formData.jumlah_uraian > 0) {
        uraianInstructions.push(`${formData.jumlah_uraian} soal uraian biasa`);
    }
    if (formData.sertakan_soal_tka_uraian && formData.jumlah_soal_tka_uraian > 0) {
        uraianInstructions.push(`${formData.jumlah_soal_tka_uraian} soal Uraian level TKA (${formData.kelompok_tka})`);
    }

    const isianInstructions = [];
    if (formData.jenis_soal?.includes('Isian Singkat') && formData.jumlah_isian_singkat > 0) {
        isianInstructions.push(`${formData.jumlah_isian_singkat} soal isian singkat`);
    }

    const soalStructureParts = [];
    if (pgInstructions.length > 0) {
        soalStructureParts.push(`- Bagian Pilihan Ganda: Buat ${pgInstructions.join(' dan ')}. Gabungkan semua soal pilihan ganda dalam satu bagian berlabel "A. Pilihan Ganda" dengan penomoran yang berurutan.`);
    }
    if (uraianInstructions.length > 0) {
        soalStructureParts.push(`- Bagian Uraian: Buat ${uraianInstructions.join(' dan ')}. Gabungkan semua soal uraian dalam satu bagian berlabel "B. Uraian" dengan penomoran yang berurutan, melanjutkan dari bagian sebelumnya.`);
    }
    if (isianInstructions.length > 0) {
        soalStructureParts.push(`- Bagian Isian Singkat: Buat ${isianInstructions.join(' dan ')}. Gabungkan dalam satu bagian berlabel "C. Isian Singkat", melanjutkan penomoran dari bagian sebelumnya.`);
    }

    const soalStructurePrompt = showPesantrenDynamicForm(formData)
        ? (formData.soal_pesantren_sections || []).map(section => 
            `- Bagian ${section.letter}: Buat ${section.count} soal sesuai perintah: "${section.instruction}"`
          ).join('\n')
        : soalStructureParts.join('\n');
    
    const insyaInstruction = formData.mata_pelajaran.toUpperCase() === 'INSYA'
        ? `**Instruksi Khusus Mapel Insya':** Fokus soal adalah pada **penerapan** kaidah Nahwu/Sharaf (Qawaid) dalam membuat kalimat atau menjawab pertanyaan, BUKAN menguji teori. Contoh: Soal "Jim" meminta siswa menyusun kata menjadi kalimat sempurna yang menuntut penerapan i'rab, atau soal "Ba" yang jawabannya memerlukan penggunaan struktur kalimat tertentu.`
        : '';

    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Anda adalah AI pembuat soal ujian ahli. Buatkan paket asesmen lengkap berdasarkan data berikut.
        **Data:**
        - Jenjang: ${formData.jenjang}
        - Kelas: ${formData.kelas}
        - Mata Pelajaran: ${formData.mata_pelajaran}
        - Topik/Materi: ${formData.topik_materi}
        - Tingkat Kesulitan: ${formData.tingkat_kesulitan}
        - Bahasa: ${formData.bahasa}
        
        **Struktur Soal yang Diminta:**
        ${soalStructurePrompt}
        ${insyaInstruction}

        **Tugas:**
        Generate dokumen-dokumen berikut dalam format JSON. Setiap dokumen harus menjadi objek dalam array 'sections', dengan 'id', 'title', dan 'content' (dalam format HTML).
        ${sectionPrompts}

        **Aturan Format:**
        - Root object harus memiliki properti "sections" yang berisi array.
        - Setiap objek section harus memiliki: "id" (string unik: ${sectionsToGenerate.map(s => `"${s.id}"`).join(', ')}), "title" (string), "content" (string HTML).
        - Untuk Naskah Soal, sertakan header ujian yang sudah disediakan di awal kontennya.
        - Untuk SEMUA DOKUMEN LAINNYA (selain Naskah Soal), sertakan blok tanda tangan guru di akhir kontennya.
        - Gunakan tag HTML standar. Untuk soal pilihan ganda, gunakan format <ol type='A'>.
        - Untuk bahasa Arab, pastikan teks rata kanan dan arah RTL. Gunakan <div dir="rtl" style="text-align: right;"> untuk membungkus konten Arab.
        
        **Header Ujian (untuk Naskah Soal):**
        \`\`\`html
        ${headerContent}
        \`\`\`

        **Blok Tanda Tangan (untuk dokumen selain Naskah Soal):**
        \`\`\`html
        ${signatureBlock}
        \`\`\`
        `,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.5,
            ...(formData.use_thinking_mode && { thinkingConfig: { thinkingBudget: 8192 } })
        }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result.sections;
};

const showPesantrenDynamicForm = (formData: FormData): boolean => {
    const isArabicContext = formData.bahasa === 'Bahasa Arab' || ARABIC_SUBJECTS.includes(formData.mata_pelajaran.toUpperCase().replace(/'|\\/g, ''));
    return formData.jenjang === 'Pesantren' && isArabicContext;
};

export const generateEcourseContent = async (formData: FormData): Promise<GeneratedSection[]> => {
    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Anda adalah seorang *Instructional Designer* ahli. Tugas Anda adalah merancang dan membuat E-Course lengkap berdasarkan data berikut.

        **Data E-Course:**
        - Topik Utama: "${formData.topik_ecourse}"
        - Jumlah Pertemuan/Modul: ${formData.jumlah_pertemuan}
        - Nama Pengajar: ${formData.nama_guru}

        **Tugas:**
        Generate paket E-Course yang komprehensif dalam format JSON. Root object harus memiliki properti "sections" yang berisi sebuah array dengan SATU objek di dalamnya. Objek ini harus memiliki: "id" (string: "ecourse_package"), "title" (string: "Paket E-Course Lengkap: [Topik Utama]"), dan "content" (string HTML).

        **Struktur Konten HTML dalam "content":**
        Konten HTML harus terstruktur dengan baik dan mencakup bagian-bagian berikut:
        1.  **Silabus & Rencana Pembelajaran (Learning Path)**:
            - Judul, Deskripsi Singkat, Tujuan Pembelajaran Umum, Target Audiens.
            - Tabel Rencana Pembelajaran yang mencakup: Nomor Pertemuan, Judul Materi, Aktivitas (Materi, Latihan, Kuis), dan Estimasi Waktu.
        2.  **Materi Pembelajaran per Pertemuan**:
            - Buat H3 untuk setiap pertemuan (Contoh: "<h3>Pertemuan 1: Judul Materi</h3>").
            - Untuk setiap pertemuan, sertakan:
                - **Tujuan Pembelajaran Khusus** (menggunakan <ul>).
                - **Materi Utama** (paragraf, poin-poin, dan penjelasan mendalam).
                - **Latihan / Studi Kasus** (deskripsi latihan yang relevan).
                - **Evaluasi / Kuis** (beberapa contoh pertanyaan singkat untuk menguji pemahaman).
        3.  **Konten Slide Presentasi (PPT)**:
            - Buat bagian khusus yang diawali dengan: \`<!-- SLIDE_CONTENT_START -->\` dan diakhiri dengan \`<!-- SLIDE_CONTENT_END -->\`.
            - Di dalam blok ini, generate konten untuk slide presentasi. Gunakan format berikut untuk setiap slide:
                - \`<div class="ppt-slide">\`
                - \`<h4 class="slide-title">Judul Slide</h4>\`
                - \`<div class="slide-content">Konten slide di sini (bisa berupa poin-poin dalam <ul><li>...</li></ul> atau paragraf).</div>\`
                - \`</div>\`
            - Pastikan untuk membuat beberapa slide yang mencakup ringkasan dari semua pertemuan.

        **Aturan Penting:**
        - Gunakan tag HTML standar (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <table>, <strong>).
        - Pastikan seluruh output adalah satu string HTML yang valid di dalam properti "content".
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: sectionsSchema,
            temperature: 0.7,
            ...(formData.use_thinking_mode && { thinkingConfig: { thinkingBudget: 16384 } })
        }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    // Process the HTML content to wrap slide content
    if (result.sections && result.sections[0] && result.sections[0].content) {
        let htmlContent = result.sections[0].content;
        const slideStartTag = '<!-- SLIDE_CONTENT_START -->';
        const slideEndTag = '<!-- SLIDE_CONTENT_END -->';
        const startIndex = htmlContent.indexOf(slideStartTag);
        const endIndex = htmlContent.indexOf(slideEndTag);

        if (startIndex !== -1 && endIndex !== -1) {
            const slideContent = htmlContent.substring(startIndex + slideStartTag.length, endIndex);
            const wrappedSlideContent = `<div class="ppt-container"><h2>Konten Slide Presentasi</h2>${slideContent}</div>`;
            htmlContent = htmlContent.substring(0, startIndex) + wrappedSlideContent + htmlContent.substring(endIndex + slideEndTag.length);
            result.sections[0].content = htmlContent;
        }
    }
    
    return result.sections;
};

// --- Missing Functions Implementation ---

// Helper functions for TTS audio decoding
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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

export const textToSpeech = async (text: string): Promise<AudioBuffer> => {
    // FIX: Explicitly type the response from generateContent to resolve the type error on 'candidates'.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with a friendly and clear female Indonesian voice: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data returned from TTS API.");
    }
    // A new context is created here just for decoding. The component will use its own context for playback.
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const decodedBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
    audioContext.close(); // Clean up the decoding context.
    return audioBuffer;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response: GenerateContentResponse = await withRetry(async () =>
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        })
    );
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('No image generated');
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await withRetry(() =>
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType } },
                    { text: prompt },
                ],
            },
            config: { responseModalities: [Modality.IMAGE] },
        })
    );
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('No image generated from edit');
};

export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64ImageData, mimeType } },
                { text: prompt },
            ],
        },
    });
    return response.text;
};

export const generateVideo = async (prompt: string, image: { imageBytes: string, mimeType: string } | null, aspectRatio: '16:9' | '9:16'): Promise<any> => {
    reinitializeGoogleGenAI(); // Ensure latest key is used
    const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: image || undefined,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });
    return operation;
};

export const checkVideoOperation = async (operation: any): Promise<any> => {
    reinitializeGoogleGenAI(); // Ensure latest key is used
    return await ai.operations.getVideosOperation({ operation });
};

export const analyzeVideoFrames = async (frames: { data: string; mimeType: string }[], prompt: string): Promise<string> => {
    const imageParts = frames.map(frame => ({
        inlineData: {
            data: frame.data,
            mimeType: frame.mimeType,
        },
    }));

    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                ...imageParts,
                { text: prompt }
            ],
        },
    });
    return response.text;
};

export const groundedSearch = async (query: string, tool: 'web' | 'maps', location?: { latitude: number, longitude: number }): Promise<{ text: string, sources: GroundingSource[] }> => {
    const tools: any[] = tool === 'web' ? [{ googleSearch: {} }] : [{ googleMaps: {} }];
    
    const config: any = { tools };
    if (tool === 'maps' && location) {
        config.toolConfig = { retrievalConfig: { latLng: location } };
    }
    
    // FIX: Explicitly type the response from generateContent to ensure type safety.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config,
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks.map((chunk: any) => {
         if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
         if (chunk.maps) return { uri: chunk.maps.uri, title: chunk.maps.title };
         return null;
    }).filter((s: any): s is GroundingSource => s !== null);

    return { text, sources };
};
