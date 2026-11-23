import { useState, useEffect } from 'react';
import { useAgent } from '../context/AgentContext';
import { API_URL, TENANT_ID } from '../lib/socket';
import { Monitor, Wifi, WifiOff } from 'lucide-react';

export const AgentSelector = () => {
  const { setSelectedAgent } = useAgent();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/agents?tenantId=${TENANT_ID}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // FILTRO: Solo mostrar los que están online, o los últimos 3 registrados
          const validAgents = data.filter(a => a.isOnline).length > 0 
            ? data.filter(a => a.isOnline) 
            : data.slice(0, 3);
          setAgents(validAgents);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Buscando dispositivos...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.length === 0 && (
          <div className="col-span-full p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No hay agentes registrados o en línea.</p>
            <p className="text-sm text-slate-400 mt-2">Asegúrate de que el servicio de Python esté corriendo.</p>
          </div>
        )}
        
        {agents.map(agent => (
          <div 
            key={agent.id} 
            onClick={() => setSelectedAgent(agent)}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl cursor-pointer hover:border-brand-500 border-2 border-transparent shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-50 dark:bg-slate-800 rounded-xl group-hover:bg-brand-500 transition-colors">
                <Monitor className="text-brand-500 group-hover:text-white transition-colors" size={24} />
              </div>
              {agent.isOnline ? (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <Wifi size={14} /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                  <WifiOff size={14} /> Offline
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{agent.name}</h3>
            <p className="text-sm text-slate-500">{agent.os}</p>
          </div>
        ))}
      </div>
    </div>
  );
};