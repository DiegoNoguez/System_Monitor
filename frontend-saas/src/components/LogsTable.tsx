import { useState, useEffect } from 'react';
import { API_URL } from '../lib/socket';
import { Terminal } from 'lucide-react';

interface Props {
  agentId: string;
}

export const LogsTable = ({ agentId }: Props) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = () => {
      fetch(`${API_URL}/api/v1/agents/${agentId}/logs`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLogs(data);
          } else {
            setLogs([]);
          }
        })
        .catch(err => console.error("Error cargando logs:", err));
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [agentId]);

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden mt-4">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
        <Terminal size={18} className="text-brand-500" />
        <h3 className="font-bold text-slate-800 dark:text-white">Historial de Acciones</h3>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{log.action}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {log.success ? 'Éxito' : 'Fallido'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-slate-500">No hay acciones registradas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};