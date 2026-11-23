import { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { socket, AGENT_ID } from '../lib/socket';

// Fíjate en el "export const" al inicio
export const FileTransfer = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const chunkSize = 64 * 1024;
    let offset = 0;

    const readNextChunk = () => {
      const chunk = file.slice(offset, offset + chunkSize);
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64Chunk = (event.target?.result as string).split(',')[1];
        const isLast = offset + chunkSize >= file.size;

        socket.emit('file_chunk', {
          agentId: AGENT_ID,
          fileName: file.name,
          chunk: base64Chunk,
          isLast: isLast
        });

        offset += chunkSize;
        const currentProgress = Math.min(100, Math.round((offset / file.size) * 100));
        setProgress(currentProgress);

        if (!isLast) {
          readNextChunk();
        } else {
          setTimeout(() => setIsUploading(false), 1000);
        }
      };

      reader.readAsDataURL(chunk);
    };

    readNextChunk();
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4">Transferencia de Archivos</h3>
      
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 mb-3 text-brand-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-brand-500">Haz clic</span> para subir un archivo</p>
        </div>
        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
      </label>

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
            <span>Subiendo...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-brand-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {!isUploading && progress === 100 && (
        <div className="mt-4 flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle2 size={16} /> Archivo enviado con éxito
        </div>
      )}
    </div>
  );
};