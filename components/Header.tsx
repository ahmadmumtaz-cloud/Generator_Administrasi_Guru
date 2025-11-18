import React from 'react';

interface HeaderProps {
  currentUser: string | null;
  onOpenApiKeyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onOpenApiKeyModal }) => {
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
          <div className="flex items-center space-x-4">
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
             <button onClick={onOpenApiKeyModal} title="Pengaturan API Key" className="p-2 rounded-full text-white bg-gray-700 hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
