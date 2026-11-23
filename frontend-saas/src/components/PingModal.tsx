import { useState } from 'react';
import { X, Wifi, WifiOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (allow: boolean, targetIp: string | null) => void;
}

export const PingModal = ({ isOpen, onClose, onConfirm }: Props) => {
  const [mode, setMode] = useState<'all' | 'specific'>('all');
  const [ip, setIp] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Configurar Bloqueo de Ping</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
            <input type="radio" checked={mode === 'all'} onChange={() => setMode('all')} className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bloquear TODOS los pings entrantes</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
            <input type="radio" checked={mode === 'specific'} onChange={() => setMode('specific')} className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bloquear solo una IP específica</span>
          </label>
          
          {mode === 'specific' && (
            <input 
              type="text" 
              placeholder="Ej: 192.168.1.50" 
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
            />
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onConfirm(false, mode === 'specific' ? ip : null)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <WifiOff size={18} /> Bloquear
          </button>
          <button 
            onClick={() => onConfirm(true, mode === 'specific' ? ip : null)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Wifi size={18} /> Permitir
          </button>
        </div>
      </div>
    </div>
  );
};