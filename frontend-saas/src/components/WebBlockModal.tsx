import { useState } from 'react';
import { X, Globe } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; onConfirm: (url: string) => void; }

export const WebBlockModal = ({ isOpen, onClose, onConfirm }: Props) => {
  const [url, setUrl] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2"><Globe /> Bloquear Web</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <input 
          type="text" placeholder="Ej: facebook.com" value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border p-3 rounded-lg mb-4 dark:text-white"
        />
        <button onClick={() => { onConfirm(url); onClose(); }} className="w-full bg-warning-500 hover:bg-warning-600 text-white py-2 rounded-lg">
          Bloquear
        </button>
      </div>
    </div>
  );
};