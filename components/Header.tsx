import React from 'react';

interface HeaderProps {
  currentUser: string | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  return (
    <header className="bg-gray-900 border-b-4 border-yellow-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="app-title" className="text-3xl font-bold text-white">
              Generator Administrasi Guru &amp; Bank Soal Adaptif
            </h1>
            <p className="text-yellow-200 mt-2">
              Wujudkan Pembelajaran Inovatif dengan Perangkat Ajar Cerdas Berbasis AI
            </p>
          </div>
          <div className="text-right">
            {currentUser ? (
              <>
                <p id="welcome-message" className="text-white font-semibold">
                  Selamat Datang, {currentUser}!
                </p>
                <p className="text-yellow-200 text-sm">Berbasis Deep Learning &amp; AI</p>
              </>
            ) : (
              <>
                <p id="institution-name" className="text-white font-semibold">
                  YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI
                </p>
                <p className="text-yellow-200 text-sm">Berbasis Deep Learning &amp; AI</p>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;