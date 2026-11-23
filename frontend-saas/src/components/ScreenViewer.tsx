import { useEffect, useState, useRef } from 'react';
import { socket } from '../lib/socket';
import { X } from 'lucide-react';

interface Props {
  agentId: string;
  onClose: () => void;
}

export const ScreenViewer = ({ agentId, onClose }: Props) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScreenData = (data: any) => {
      if (data.agentId === agentId) {
        setImgSrc(data.image);
      }
    };

    socket.on('screen_data', handleScreenData);

    intervalRef.current = window.setInterval(() => {
      socket.emit('request_screen', { agentId });
    }, 1500);

    return () => {
      socket.off('screen_data', handleScreenData);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [agentId]);

  return (
    <div className="bg-black rounded-2xl overflow-hidden relative border border-slate-700 shadow-2xl flex items-center justify-center min-h-[400px]">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full z-10 transition-colors"
      >
        <X size={20} />
      </button>
      
      {imgSrc ? (
        <img src={imgSrc} alt="Pantalla Remota" className="w-full h-auto object-contain" />
      ) : (
        <div className="text-slate-400 flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Conectando con la pantalla remota...
        </div>
      )}
    </div>
  );
};