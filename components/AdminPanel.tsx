import React, { useState } from 'react';
import { ShareableLink } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  links: ShareableLink[];
  onAddLink: (userName: string) => void;
  onDeleteLink: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, links, onAddLink, onDeleteLink }) => {
  const [newUserName, setNewUserName] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleAddClick = () => {
    if (newUserName.trim()) {
      onAddLink(newUserName.trim());
      setNewUserName('');
    }
  };

  const handleCopyClick = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000); // Reset after 2 seconds
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl flex flex-col" style={{ height: '90vh' }}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Ruang Admin - Pelacakan Pengguna</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="mb-6 border-b pb-6 flex-shrink-0">
          <h3 className="text-lg font-semibold mb-2">Buat Tautan Pengguna Baru</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Nama Pengguna (Contoh: Budi)"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Buat Link
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Tautan yang Dihasilkan</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pengguna</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link Unik</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Penggunaan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Belum ada tautan yang dibuat.
                    </td>
                  </tr>
                ) : (
                  links.map(link => (
                    <tr key={link.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{link.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                           <input type="text" readOnly value={link.url} className="w-full bg-gray-100 p-1 rounded border text-xs" />
                           <button onClick={() => handleCopyClick(link.url)} className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">
                             {copiedUrl === link.url ? 'Tersalin!' : 'Salin'}
                           </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-center">{link.usageCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => onDeleteLink(link.id)} className="text-red-600 hover:text-red-900">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
