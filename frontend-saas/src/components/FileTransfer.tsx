import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { socket } from '../lib/socket';

export const FileTransfer = ({ agentId }: { agentId: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    socket.on('receive_file_chunk_from_agent', (data: any) => {
      if (data.agentId === agentId) {
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${data.chunk}`;
        link.download = data.fileName;
        link.click();
      }
    });
  }, [agentId]);

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProgress(10);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      socket.emit('file_chunk', { agentId, fileName: file.name, chunk: base64, isLast: true });
      setProgress(100);
      setTimeout(() => setProgress(0), 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl">
      <h3 className="font-bold dark:text-white mb-4">Transferencia de Archivos</h3>
      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
        <UploadCloud className="text-brand-500 mb-2" />
        <span className="text-sm text-slate-500">Subir archivo a la PC remota</span>
        <input type="file" className="hidden" onChange={uploadFile} />
      </label>
      {progress > 0 && <div className="w-full bg-slate-200 mt-4 h-2 rounded-full"><div className="bg-brand-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div></div>}
    </div>
  );
};