import { useState, useEffect } from 'react';
import { useAgent } from '../context/AgentContext';
import { API_URL, TENANT_ID } from '../lib/socket';
import { Monitor } from 'lucide-react';

export const AgentSelector = () => {
  const { setSelectedAgent } = useAgent();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/agents?tenantId=${TENANT_ID}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAgents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Buscando agentes...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-white">Selecciona una PC Remota</h2>
      <div className="space-y-3">
        {agents.length === 0 && <p className="text-center text-slate-500">No hay agentes registrados. Enciende Python.</p>}
        {agents.map(agent => (
          <div 
            key={agent.id} 
            onClick={() => setSelectedAgent(agent)}
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:border-brand-500 border border-transparent transition-all flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Monitor className="text-brand-500" />
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{agent.name}</p>
                <p className="text-xs text-slate-400">{agent.os}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${agent.isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
              {agent.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};