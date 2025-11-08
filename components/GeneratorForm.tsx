import React, { useState, useEffect } from 'react';
import { Module, FormData } from '../types';
import { KELAS_OPTIONS, MATA_PELAJARAN_OPTIONS, ALOKASI_WAKTU_OPTIONS } from '../constants';
import Spinner from './Spinner';

interface GeneratorFormProps {
  module: Module;
  onSubmit: (formData: FormData) => void;
  onBack: () => void;
  onShowAIAssistant: (data: Partial<FormData>, type: 'cp' | 'topic') => void;
  isLoading: boolean;
  generationProgress: number;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ module, onSubmit, onBack, onShowAIAssistant, isLoading, generationProgress }) => {
  const [formData, setFormData] = useState<FormData>(() => {
    const defaultData: FormData = {
      jenjang: '', kelas: '', semester: '1', mata_pelajaran: '', 
      sekolah: 'SEKOLAH MENENGAH ATAS (SMA) ISLAM AL-GHOZALI',
      tahun_ajaran: '2025-2026', nama_guru: '', fase: '',
      cp_elements: '', alokasi_waktu: '', jumlah_modul_ajar: 1,
      topik_materi: '', sertakan_kisi_kisi: true, sertakan_soal_tka: false,
      jumlah_soal_tka: 5, kelompok_tka: 'saintek', jumlah_soal_total: 20,
      jenis_soal: ['Pilihan Ganda', 'Uraian'], jumlah_pg: 15, jumlah_uraian: 5,
      jumlah_isian_singkat: 0, 
      jenis_soal_pesantren: ['Alif', 'Ba'], jumlah_soal_alif: 10, jumlah_soal_ba: 5,
      jumlah_soal_jim: 5, jumlah_soal_dal: 5, jumlah_soal_ha: 1,
      tingkat_kesulitan: 'Sedang', bahasa: 'Bahasa Indonesia',
      yayasan: 'YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI',
      alamat_sekolah: 'Jl. Permata No. 19 Curug Gunungsindur Kab. Bogor 16340',
      logo_sekolah: '',
      judul_asesmen: 'PENILAIAN SUMATIF AKHIR SEMESTER GANJIL',
      tanggal_ujian: '',
      jam_ke: '', waktu_ujian: '90 Menit', use_thinking_mode: false,
    };
    try {
        const savedData = localStorage.getItem('guruAppData');
        if (savedData) return { ...defaultData, ...JSON.parse(savedData) };
    } catch (error) { console.error("Failed to load saved form data", error); }
    return defaultData;
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [totalSoalError, setTotalSoalError] = useState<string | null>(null);

  useEffect(() => {
    try {
        const {
            sekolah, nama_guru, yayasan, alamat_sekolah, jenjang, kelas, mata_pelajaran, tahun_ajaran, bahasa, semester
        } = formData;
        const dataToSave = {
            sekolah, nama_guru, yayasan, alamat_sekolah, jenjang, kelas, mata_pelajaran, tahun_ajaran, bahasa, semester
        };
        localStorage.setItem('guruAppData', JSON.stringify(dataToSave));
    } catch (error) { 
        console.error("Failed to save form data", error); 
    }
  }, [formData.sekolah, formData.nama_guru, formData.yayasan, formData.alamat_sekolah, formData.jenjang, formData.kelas, formData.mata_pelajaran, formData.tahun_ajaran, formData.bahasa, formData.semester]);

  useEffect(() => {
    if (formData.jenjang) {
      setKelasOptions(KELAS_OPTIONS[formData.jenjang] || []);
      setMataPelajaranOptions(MATA_PELAJARAN_OPTIONS[formData.jenjang] || []);
      setAlokasiWaktuOptions(ALOKASI_WAKTU_OPTIONS[formData.jenjang] || []);
      
      const savedData = JSON.parse(localStorage.getItem('guruAppData') || '{}');
      if (savedData.jenjang !== formData.jenjang) {
        setFormData(prev => ({ ...prev, kelas: '', mata_pelajaran: '' }));
      }
      setShowCustomSubject(false);
    } else {
      setKelasOptions([]); setMataPelajaranOptions([]); setAlokasiWaktuOptions([]);
    }
  }, [formData.jenjang]);
  
  useEffect(() => {
    setLogoPreview(null);
    setShowCustomSubject(false);
  }, [module]);

  useEffect(() => {
    const { jenjang, kelas } = formData;
    let newFase = '';
    const kelasNum = parseInt(kelas, 10);
    if (jenjang === 'SD' || jenjang === 'MI') {
        if (kelasNum <= 2) newFase = 'Fase A'; else if (kelasNum <= 4) newFase = 'Fase B'; else newFase = 'Fase C';
    } else if (jenjang === 'SMP' || jenjang === 'MTS') newFase = 'Fase D';
    else if (jenjang === 'SMA' || jenjang === 'MA') newFase = kelasNum === 10 ? 'Fase E' : 'Fase F';
    else if (jenjang === 'Pesantren') newFase = ''; // Clear fase for Pesantren
    
    if (newFase !== formData.fase) setFormData(prev => ({ ...prev, fase: newFase }));
  }, [formData.jenjang, formData.kelas]);
  
  useEffect(() => {
    if (module === 'soal') {
      let total = 0;
      if (formData.jenjang === 'Pesantren') {
        const alifCount = formData.jenis_soal_pesantren?.includes('Alif') ? (Number(formData.jumlah_soal_alif) || 0) : 0;
        const baCount = formData.jenis_soal_pesantren?.includes('Ba') ? (Number(formData.jumlah_soal_ba) || 0) : 0;
        const jimCount = formData.jenis_soal_pesantren?.includes('Jim') ? (Number(formData.jumlah_soal_jim) || 0) : 0;
        const dalCount = formData.jenis_soal_pesantren?.includes('Dal') ? (Number(formData.jumlah_soal_dal) || 0) : 0;
        const haCount = formData.mata_pelajaran.toUpperCase() === 'INSYA' && formData.jenis_soal_pesantren?.includes('Ha') ? (Number(formData.jumlah_soal_ha) || 0) : 0;
        total = alifCount + baCount + jimCount + dalCount + haCount;
      } else {
        const pgCount = formData.jenis_soal?.includes('Pilihan Ganda') ? (Number(formData.jumlah_pg) || 0) : 0;
        const uraianCount = formData.jenis_soal?.includes('Uraian') ? (Number(formData.jumlah_uraian) || 0) : 0;
        const isianCount = formData.jenis_soal?.includes('Isian Singkat') ? (Number(formData.jumlah_isian_singkat) || 0) : 0;
        total = pgCount + uraianCount + isianCount;
      }

      if (total > (Number(formData.jumlah_soal_total) || 0)) {
        setTotalSoalError(`Jumlah soal per jenis (${total}) melebihi total soal standar (${formData.jumlah_soal_total}).`);
      } else {
        setTotalSoalError(null);
      }
    } else {
      setTotalSoalError(null);
    }
  }, [
    formData.jumlah_pg, formData.jumlah_uraian, formData.jumlah_isian_singkat,
    formData.jumlah_soal_total, formData.jenis_soal, module, formData.jenjang,
    formData.jenis_soal_pesantren, formData.jumlah_soal_alif, formData.jumlah_soal_ba,
    formData.jumlah_soal_jim, formData.jumlah_soal_dal, formData.jumlah_soal_ha, formData.mata_pelajaran
  ]);

  const [kelasOptions, setKelasOptions] = useState<string[]>([]);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState<string[]>([]);
  const [alokasiWaktuOptions, setAlokasiWaktuOptions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
        setShowCustomSubject(true);
        setFormData(prev => ({ ...prev, mata_pelajaran: ''}));
    } else {
        setShowCustomSubject(false);
        setFormData(prev => ({ ...prev, mata_pelajaran: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      const newJenisSoal = checked ? [...(prev.jenis_soal || []), name] : (prev.jenis_soal || []).filter(item => item !== name);
      return { ...prev, jenis_soal: newJenisSoal };
    });
  };

  const handleCheckboxChangePesantren = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      const newJenisSoal = checked ? [...(prev.jenis_soal_pesantren || []), name] : (prev.jenis_soal_pesantren || []).filter(item => item !== name);
      return { ...prev, jenis_soal_pesantren: newJenisSoal };
    });
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({ ...prev, logo_sekolah: base64String }));
            setLogoPreview(base64String);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(totalSoalError) return;
    onSubmit(formData);
  };

  const title = module === 'admin' ? 'Generator Administrasi Guru' : 'Generator Bank Soal';
  const description = module === 'admin' ? 'Lengkapi form untuk menghasilkan ATP, Prota, Promes, Modul Ajar, KKTP, dan Jurnal Harian.' : 'Lengkapi form untuk menghasilkan bank soal dan perangkat asesmen adaptif.';
  const formElementClasses = "w-full rounded-md border-2 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 ease-in-out";

  return (
    <div className="bg-white rounded-lg card-shadow p-6 fade-in">
      <div className="mb-6">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">&larr; Kembali ke Dashboard</button>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common Fields */}
        <div className="grid md:grid-cols-4 gap-6">
          <select id="jenjang" name="jenjang" value={formData.jenjang} onChange={handleChange} required className={formElementClasses} aria-label="Jenjang"><option value="">Pilih Jenjang</option><option>SD</option><option>MI</option><option>SMP</option><option>MTS</option><option>SMA</option><option>MA</option><option>Pesantren</option></select>
          <select id="kelas" name="kelas" value={formData.kelas} onChange={handleChange} required disabled={!formData.jenjang} className={`${formElementClasses} disabled:bg-gray-100`} aria-label="Kelas"><option value="">Pilih Kelas</option>{kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}</select>
          <select id="mata_pelajaran_select" name="mata_pelajaran_select" value={showCustomSubject ? 'custom' : formData.mata_pelajaran} onChange={handleSubjectChange} required disabled={!formData.jenjang} className={`${formElementClasses} disabled:bg-gray-100`} aria-label="Mata Pelajaran"><option value="">Pilih Mapel</option>{mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}<option value="custom">Lainnya...</option></select>
          <select id="bahasa" name="bahasa" value={formData.bahasa} onChange={handleChange} className={formElementClasses} aria-label="Bahasa"><option>Bahasa Indonesia</option><option>Bahasa Inggris</option><option>Bahasa Sunda</option><option>Bahasa Arab</option></select>
        </div>
        {showCustomSubject && <input type="text" id="mata_pelajaran" name="mata_pelajaran" value={formData.mata_pelajaran} onChange={handleChange} required className={`mt-1 block ${formElementClasses}`} placeholder="Tulis nama mata pelajaran..."/>}
        <div className="grid md:grid-cols-2 gap-6">
            <select id="semester" name="semester" value={formData.semester} onChange={handleChange} required className={formElementClasses} aria-label="Semester">
                <option value="1">Semester 1 (Ganjil)</option>
                <option value="2">Semester 2 (Genap)</option>
            </select>
            <input type="text" id="tahun_ajaran" name="tahun_ajaran" value={formData.tahun_ajaran} onChange={handleChange} required className={formElementClasses} placeholder="Tahun Ajaran" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <input type="text" id="sekolah" name="sekolah" value={formData.sekolah} onChange={handleChange} required className={formElementClasses} placeholder="Nama Sekolah" />
          <input type="text" id="nama_guru" name="nama_guru" value={formData.nama_guru} onChange={handleChange} required className={formElementClasses} placeholder="Nama Pengajar" />
        </div>
        <hr/>
        {module === 'admin' && (
          <div className="space-y-6">
             <div className="grid md:grid-cols-3 gap-6">
                <select id="fase" name="fase" value={formData.fase} onChange={handleChange} required={formData.jenjang !== 'Pesantren'} disabled={formData.jenjang === 'Pesantren'} className={`${formElementClasses} bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed`}><option value="">{formData.jenjang === 'Pesantren' ? 'Tidak ada Fase' : 'Pilih Fase'}</option><option value="Fase A">Fase A (1-2 SD/MI)</option><option value="Fase B">Fase B (3-4 SD/MI)</option><option value="Fase C">Fase C (5-6 SD/MI)</option><option value="Fase D">Fase D (7-9 SMP/MTS)</option><option value="Fase E">Fase E (10 SMA/MA)</option><option value="Fase F">Fase F (11-12 SMA/MA)</option></select>
                <select id="alokasi_waktu" name="alokasi_waktu" value={formData.alokasi_waktu} onChange={handleChange} required disabled={!formData.jenjang} className={`${formElementClasses} disabled:bg-gray-100`}><option value="">Alokasi Waktu</option>{alokasiWaktuOptions.map(aw => <option key={aw} value={aw}>{aw}</option>)}</select>
                <input type="number" id="jumlah_modul_ajar" name="jumlah_modul_ajar" value={formData.jumlah_modul_ajar} onChange={handleChange} required min="1" max="20" className={formElementClasses} placeholder="Jumlah Modul Ajar" />
            </div>
            <textarea id="cp_elements" name="cp_elements" value={formData.cp_elements ?? ''} onChange={handleChange} required rows={4} className={formElementClasses} placeholder="Elemen Capaian Pembelajaran (CP)..."></textarea>
            <button type="button" onClick={() => onShowAIAssistant(formData, 'cp')} className="text-sm text-blue-600 font-semibold hover:underline">✨ Dapatkan saran dari AI Asisten</button>
          </div>
        )}
        
        {module === 'soal' && formData.jenjang !== 'Pesantren' && (
           <div className="space-y-6">
                <textarea id="topik_materi" name="topik_materi" value={formData.topik_materi ?? ''} onChange={handleChange} required rows={3} className={formElementClasses} placeholder="Topik / Materi..."></textarea>
                <button type="button" onClick={() => onShowAIAssistant(formData, 'topic')} className="text-sm text-blue-600 font-semibold hover:underline">✨ Dapatkan saran dari AI Asisten</button>
                <input type="number" id="jumlah_soal_total" name="jumlah_soal_total" value={formData.jumlah_soal_total} onChange={handleChange} className={formElementClasses} placeholder="Total Soal Standar"/>
                <div className="flex space-x-4"><label><input type="checkbox" name="Pilihan Ganda" checked={formData.jenis_soal?.includes('Pilihan Ganda')} onChange={handleCheckboxChange}/> PG</label><label><input type="checkbox" name="Uraian" checked={formData.jenis_soal?.includes('Uraian')} onChange={handleCheckboxChange}/> Uraian</label><label><input type="checkbox" name="Isian Singkat" checked={formData.jenis_soal?.includes('Isian Singkat')} onChange={handleCheckboxChange}/> Isian</label></div>
                <div className="grid md:grid-cols-3 gap-6">
                    {formData.jenis_soal?.includes('Pilihan Ganda') && <input type="number" name="jumlah_pg" value={formData.jumlah_pg} onChange={handleChange} className={formElementClasses} placeholder="Jumlah PG" />}
                    {formData.jenis_soal?.includes('Uraian') && <input type="number" name="jumlah_uraian" value={formData.jumlah_uraian} onChange={handleChange} className={formElementClasses} placeholder="Jumlah Uraian" />}
                    {formData.jenis_soal?.includes('Isian Singkat') && <input type="number" name="jumlah_isian_singkat" value={formData.jumlah_isian_singkat} onChange={handleChange} className={formElementClasses} placeholder="Jumlah Isian" />}
                </div>
                 {totalSoalError && <p className="text-sm text-red-600">{totalSoalError}</p>}
                {['SMA', 'MA'].includes(formData.jenjang) && <div className="p-4 bg-indigo-50 border rounded-lg"><label><input type="checkbox" name="sertakan_soal_tka" checked={formData.sertakan_soal_tka} onChange={handleChange}/> Tambah soal TKA-UTBK</label>{formData.sertakan_soal_tka && <div className="grid md:grid-cols-2 gap-6 mt-2"><input type="number" name="jumlah_soal_tka" value={formData.jumlah_soal_tka} onChange={handleChange} className={formElementClasses} min="1" max="10" /><select name="kelompok_tka" value={formData.kelompok_tka} onChange={handleChange} className={formElementClasses}><option value="saintek">SAINTEK</option><option value="soshum">SOSHUM</option></select></div>}</div>}
                <div className="grid md:grid-cols-2 gap-6"><select name="tingkat_kesulitan" value={formData.tingkat_kesulitan} onChange={handleChange} className={formElementClasses}><option>Mudah</option><option>Sedang</option><option>Sulit (HOTS)</option></select><label><input type="checkbox" name="sertakan_kisi_kisi" checked={formData.sertakan_kisi_kisi} onChange={handleChange}/> Sertakan Kisi-kisi</label></div>
                <hr/>
                <h3 className="text-lg font-medium">Kustomisasi Header Soal</h3>
                <input type="file" id="logo_sekolah" name="logo_sekolah" accept="image/*" onChange={handleLogoChange} className="text-sm" />
                <div className="grid md:grid-cols-2 gap-6"><input type="text" name="yayasan" value={formData.yayasan} onChange={handleChange} className={formElementClasses} placeholder="Nama Yayasan"/><input type="text" name="alamat_sekolah" value={formData.alamat_sekolah} onChange={handleChange} className={formElementClasses} placeholder="Alamat Sekolah"/></div>
           </div>
        )}

        {module === 'soal' && formData.jenjang === 'Pesantren' && (
            <div className="space-y-6">
                <textarea id="topik_materi" name="topik_materi" value={formData.topik_materi ?? ''} onChange={handleChange} required rows={3} className={formElementClasses} placeholder="Topik / Materi..."></textarea>
                <button type="button" onClick={() => onShowAIAssistant(formData, 'topic')} className="text-sm text-blue-600 font-semibold hover:underline">✨ Dapatkan saran dari AI Asisten</button>
                <input type="number" id="jumlah_soal_total" name="jumlah_soal_total" value={formData.jumlah_soal_total} onChange={handleChange} className={formElementClasses} placeholder="Total Soal Standar"/>
                
                <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="font-semibold mb-3">Pilih Jenis Soal Pesantren (Bukan Pilihan Ganda)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <label className="flex items-center space-x-2"><input type="checkbox" name="Alif" checked={formData.jenis_soal_pesantren?.includes('Alif')} onChange={handleCheckboxChangePesantren}/> <span>Alif (Isian Singkat)</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" name="Ba" checked={formData.jenis_soal_pesantren?.includes('Ba')} onChange={handleCheckboxChangePesantren}/> <span>Ba (Menjawab Pertanyaan)</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" name="Jim" checked={formData.jenis_soal_pesantren?.includes('Jim')} onChange={handleCheckboxChangePesantren}/> <span>Jim (Membuat Kalimat)</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" name="Dal" checked={formData.jenis_soal_pesantren?.includes('Dal')} onChange={handleCheckboxChangePesantren}/> <span>Dal (Menerjemahkan)</span></label>
                        {formData.mata_pelajaran.toUpperCase() === 'INSYA' && (
                            <label className="flex items-center space-x-2"><input type="checkbox" name="Ha" checked={formData.jenis_soal_pesantren?.includes('Ha')} onChange={handleCheckboxChangePesantren}/> <span>Ha (Karangan Insya)</span></label>
                        )}
                    </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    {formData.jenis_soal_pesantren?.includes('Alif') && <input type="number" name="jumlah_soal_alif" value={formData.jumlah_soal_alif} onChange={handleChange} className={formElementClasses} placeholder="Jumlah Soal Alif" />}
                    {formData.jenis_soal_pesantren?.includes('Ba') && <input type="number" name="jumlah_soal_ba" value={formData.jumlah_soal_ba} onChange={handleChange} className={formElementClasses} placeholder="Jumlah Soal Ba" />}
                    {formData.jenis_soal_pesantren?.includes('Jim') && <input type="number" name="jumlah_soal_jim" value={formData.jumlah_soal_jim} onChange={handleChange} className={formElementClasses} placeholder="Jumlah Soal Jim" />}
                    {formData.jenis_soal_pesantren?.includes('Dal') && <input type="number" name="jumlah_soal_dal" value={formData.jumlah_soal_dal} onChange={handleChange} className={formElementClasses} placeholder="Jumlah Soal Dal" />}
                    {formData.mata_pelajaran.toUpperCase() === 'INSYA' && formData.jenis_soal_pesantren?.includes('Ha') && <input type="number" name="jumlah_soal_ha" value={formData.jumlah_soal_ha} onChange={handleChange} className={formElementClasses} placeholder="Jumlah Soal Ha" />}
                </div>

                {totalSoalError && <p className="text-sm text-red-600">{totalSoalError}</p>}
                
                <div className="grid md:grid-cols-2 gap-6">
                    <select name="tingkat_kesulitan" value={formData.tingkat_kesulitan} onChange={handleChange} className={formElementClasses}><option>Mudah</option><option>Sedang</option><option>Sulit (HOTS)</option></select>
                    <label><input type="checkbox" name="sertakan_kisi_kisi" checked={formData.sertakan_kisi_kisi} onChange={handleChange}/> Sertakan Kisi-kisi</label>
                </div>
                <hr/>
                <h3 className="text-lg font-medium">Kustomisasi Header Soal</h3>
                <input type="file" id="logo_sekolah" name="logo_sekolah" accept="image/*" onChange={handleLogoChange} className="text-sm" />
                <div className="grid md:grid-cols-2 gap-6"><input type="text" name="yayasan" value={formData.yayasan} onChange={handleChange} className={formElementClasses} placeholder="Nama Yayasan"/><input type="text" name="alamat_sekolah" value={formData.alamat_sekolah} onChange={handleChange} className={formElementClasses} placeholder="Alamat Sekolah"/></div>
           </div>
        )}
        
        <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="form-control">
                <label className="cursor-pointer label">
                    <span className="label-text font-semibold text-gray-700 mr-2">🧠 Mode Cerdas (HOTS & Analisis Mendalam)</span> 
                    <input type="checkbox" name="use_thinking_mode" checked={!!formData.use_thinking_mode} onChange={handleChange} className="toggle toggle-primary" />
                </label>
            </div>
            <p className="text-xs text-gray-500">Menggunakan model AI yang lebih kuat untuk hasil yang lebih komprehensif. <br/>Proses generate mungkin sedikit lebih lama.</p>
        </div>

        {isLoading && <div className="my-4"><div className="flex justify-between mb-1"><span className="font-medium text-indigo-700">AI Sedang Bekerja...</span><span className="font-medium text-indigo-700">{Math.round(generationProgress)}%</span></div><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${generationProgress}%` }}></div></div></div>}
        <div className="flex justify-end pt-2">
            <button type="submit" disabled={isLoading || !!totalSoalError} className="inline-flex items-center justify-center px-6 py-2 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {isLoading ? <><Spinner /><span className="ml-2">Generating...</span></> : 'Generate Perangkat'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default GeneratorForm;