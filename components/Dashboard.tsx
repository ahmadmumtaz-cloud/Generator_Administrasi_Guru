import React from 'react';
import { Module, View } from '../types';

interface DashboardProps {
  onModuleSelect: (module: Module | View) => void;
  isAdmin: boolean;
}

const modules = [
  {
    id: 'admin',
    title: 'Generator Administrasi Guru',
    description: 'ATP, Prota, Promes, Modul Ajar, KKTP, & Jurnal Harian.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    ),
    color: 'blue',
  },
  {
    id: 'soal',
    title: 'Generator Bank Soal',
    description: 'Bank soal adaptif, kisi-kisi, & rubrik penilaian.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
      </svg>
    ),
    color: 'green',
  },
  {
    id: 'ecourse',
    title: 'Generator E-Course',
    description: 'Silabus, materi, latihan, evaluasi, & slide presentasi.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.394 2.08a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    ),
    color: 'yellow',
  },
  {
    id: 'audioLab',
    title: 'Lab Audio & Percakapan',
    description: 'Percakapan real-time dengan AI & transkripsi audio.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V14a1 1 0 10-2 0v.93a7 7 0 00-5 6.47A1 1 0 005 22h10a1 1 0 00.997-1.47A7 7 0 0011 14.93z" clipRule="evenodd" /></svg>
    ),
    color: 'teal',
  },
  {
    id: 'groundedSearch',
    title: 'Pencarian Cerdas',
    description: 'Dapatkan jawaban akurat dari web & peta terkini.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
    ),
    color: 'pink',
  },
  {
    id: 'imageLab',
    title: 'Studio Gambar AI',
    description: 'Buat, edit, dan analisis gambar dengan AI.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ),
    color: 'purple',
  },
  {
    id: 'videoLab',
    title: 'Studio Video AI',
    description: 'Buat video dari teks/gambar & analisis konten video.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
      </svg>
    ),
    color: 'red',
  },
  {
    id: 'ebook',
    title: 'Perpustakaan Digital',
    description: 'Akses ribuan buku digital resmi dari Kemendikbud.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
      </svg>
    ),
    color: 'orange',
    url: 'https://buku.kemendikdasmen.go.id/',
  },
  {
    id: 'quran',
    title: "Al-Qur'an Digital",
    description: "Akses Al-Qur'an digital lengkap dari Kemenag.",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
        </svg>
    ),
    color: 'indigo',
    url: 'https://quran.kemenag.go.id/',
  },
  {
    id: 'hadits',
    title: "Hadits Digital",
    description: "Akses koleksi hadits lengkap dari Hadits.id.",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
        </svg>
    ),
    color: 'cyan',
    url: 'https://www.hadits.id/',
  },
  {
    id: 'perpusnas',
    title: 'Perpustakaan Nasional',
    description: 'Jelajahi koleksi buku baru dari Perpusnas RI.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
        </svg>
    ),
    color: 'gray',
    url: 'https://www.perpusnas.go.id/buku-baru',
  }
];

const colorClasses = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-200', hoverBg: 'hover:bg-blue-50', hoverBorder: 'hover:border-blue-500' },
    green: { bg: 'bg-green-500', border: 'border-green-200', hoverBg: 'hover:bg-green-50', hoverBorder: 'hover:border-green-500' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-200', hoverBg: 'hover:bg-yellow-50', hoverBorder: 'hover:border-yellow-500' },
    teal: { bg: 'bg-teal-500', border: 'border-teal-200', hoverBg: 'hover:bg-teal-50', hoverBorder: 'hover:border-teal-500' },
    pink: { bg: 'bg-pink-500', border: 'border-pink-200', hoverBg: 'hover:bg-pink-50', hoverBorder: 'hover:border-pink-500' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-200', hoverBg: 'hover:bg-purple-50', hoverBorder: 'hover:border-purple-500' },
    red: { bg: 'bg-red-500', border: 'border-red-200', hoverBg: 'hover:bg-red-50', hoverBorder: 'hover:border-red-500' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-200', hoverBg: 'hover:bg-orange-50', hoverBorder: 'hover:border-orange-500' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-200', hoverBg: 'hover:bg-indigo-50', hoverBorder: 'hover:border-indigo-500' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-200', hoverBg: 'hover:bg-cyan-50', hoverBorder: 'hover:border-cyan-500' },
    gray: { bg: 'bg-gray-500', border: 'border-gray-200', hoverBg: 'hover:bg-gray-50', hoverBorder: 'hover:border-gray-500' }
}

const Dashboard: React.FC<DashboardProps> = ({ onModuleSelect, isAdmin }) => {
  const allowedUserModules = ['admin', 'soal', 'ebook'];
  const visibleModules = isAdmin ? modules : modules.filter(mod => allowedUserModules.includes(mod.id));
  
  const gridLayoutClass = isAdmin
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Selamat Datang di Toolkit AI Guru</h2>
        <p className="mt-1 text-xl font-semibold text-gray-700">YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI</p>
        <p className="mt-4 text-lg text-gray-600">
          {isAdmin ? "Pilih salah satu alat canggih di bawah ini untuk memulai." : "Silakan pilih modul yang tersedia untuk memulai."}
        </p>
      </div>
      <div className={`grid ${gridLayoutClass} gap-6`}>
        {visibleModules.map((mod) => {
          const colors = colorClasses[mod.color as keyof typeof colorClasses];
          const isExternal = 'url' in mod && mod.url;
          
          const commonClasses = `module-btn p-6 border-2 ${colors.border} rounded-lg ${colors.hoverBorder} ${colors.hoverBg} transition-all duration-200 text-left flex flex-col items-start card-shadow`;
          
          const content = (
            <>
              <div className="flex items-center mb-3 w-full">
                <div className={`w-16 h-16 ${colors.bg} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
                  {mod.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{mod.title}</h3>
              </div>
              <p className="text-gray-600">{mod.description}</p>
            </>
          );

          if (isExternal) {
            return (
              <a
                href={mod.url}
                target="_blank"
                rel="noopener noreferrer"
                id={`tour-step-${mod.id}`}
                key={mod.id}
                className={commonClasses}
              >
                {content}
              </a>
            )
          }

          return (
            <button
              id={`tour-step-${mod.id}`}
              key={mod.id}
              onClick={() => onModuleSelect(mod.id as any)}
              className={commonClasses}
            >
              {content}
            </button>
          )
        })}

        {isAdmin && (
            <button
                id="tour-step-admin-panel"
                onClick={() => onModuleSelect('adminPanel')}
                className="module-btn p-6 border-2 border-slate-200 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-all duration-200 text-left flex items-center card-shadow col-span-1 md:col-span-2 lg:col-span-4"
            >
                <div className="w-16 h-16 bg-slate-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM7 8a3 3 0 116 0 3 3 0 01-6 0z" clipRule="evenodd" />
                        <path d="M5.433 13.407A7.002 7.002 0 0012 15a7.002 7.002 0 006.567-1.593A5 5 0 0012 11a5 5 0 00-6.567 2.407z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Ruang Admin</h3>
                    <p className="text-gray-600">Kelola pengguna dan lihat statistik penggunaan aplikasi.</p>
                </div>
            </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;