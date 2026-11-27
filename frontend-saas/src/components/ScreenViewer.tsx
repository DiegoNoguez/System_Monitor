import { useEffect, useState, useRef } from 'react';
import { socket } from '../lib/socket';
import { X } from 'lucide-react';

export const ScreenViewer = ({ agentId, onClose }: { agentId: string, onClose: () => void }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    socket.emit('start_stream', { agentId });
    const handleData = (data: any) => { if (data.agentId === agentId) setImgSrc(data.image); };
    socket.on('screen_data', handleData);
    return () => {
      socket.emit('stop_stream', { agentId });
      socket.off('screen_data', handleData);
    };
  }, [agentId]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    // Asumiendo resolución base 1920x1080 para el mapeo de clics
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1920); 
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
    socket.emit('remote_mouse_event', { agentId, action: 'click', x, y });
  };

  return (
    <div className="relative border-2 border-slate-700 rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[300px]">
      <button onClick={onClose} className="absolute top-4 right-4 bg-red-500 p-2 rounded-full text-white z-10"><X size={20}/></button>
      {imgSrc ? (
        <img ref={imgRef} src={imgSrc} onClick={handleImageClick} className="w-full cursor-crosshair object-contain" />
      ) : (
        <div className="text-white animate-pulse">Conectando pantalla...</div>
      )}
    </div>
  );
};