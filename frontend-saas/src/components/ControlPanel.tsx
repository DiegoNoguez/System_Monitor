import { useState, useEffect } from 'react';
import { Lock, Unlock, Power, Globe, Wifi, MonitorPlay, Loader2 } from 'lucide-react';
import { socket } from '../lib/socket';
import { PingModal } from './PingModal';
import { WebBlockModal } from './WebBlockModal';

export const ControlPanel = ({ agentId, onShowScreen }: { agentId: string, onShowScreen: () => void }) => {
  const [isPingOpen, setIsPingOpen] = useState(false);
  const [isWebOpen, setIsWebOpen] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    socket.on('agent_response', (data) => {
      if (data.agentId === agentId) setExecuting(null);
    });
  }, [agentId]);

  const sendCmd = (cmd: string, payload?: any) => {
    setExecuting(cmd);
    socket.emit('send_command', { agentId, command: cmd, payload });
    setTimeout(() => setExecuting(null), 5000);
  };

  const btnClass = (cmd: string, hover: string) => `flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${executing === cmd ? 'opacity-50 cursor-wait' : `bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${hover}`}`;

  return (
    <>
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border shadow-xl">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">Panel de Control</h2>
          <button onClick={onShowScreen} className="bg-brand-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"><MonitorPlay size={18}/> Ver Pantalla</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => sendCmd('BLOCK_INPUT')} className={btnClass('BLOCK_INPUT', 'hover:text-red-500')}>
            {executing === 'BLOCK_INPUT' ? <Loader2 className="animate-spin mb-2" /> : <Lock className="mb-2" />} <span>Bloquear</span>
          </button>
          <button onClick={() => sendCmd('UNBLOCK_INPUT')} className={btnClass('UNBLOCK_INPUT', 'hover:text-green-500')}>
            {executing === 'UNBLOCK_INPUT' ? <Loader2 className="animate-spin mb-2" /> : <Unlock className="mb-2" />} <span>Desbloquear</span>
          </button>
          
          <button onClick={() => setIsWebOpen(true)} className={btnClass('BLOCK_WEB', 'hover:text-yellow-500')}>
             <Globe className="mb-2" /> <span>Bloquear Web</span>
          </button>
          
          <button onClick={() => setIsPingOpen(true)} className={btnClass('PING', 'hover:text-orange-500')}>
             <Wifi className="mb-2" /> <span>Config. Ping</span>
          </button>
          
          <button onClick={() => sendCmd('SHUTDOWN')} className="col-span-2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl flex justify-center items-center gap-2">
            {executing === 'SHUTDOWN' ? <Loader2 className="animate-spin" /> : <Power />} Apagar PC
          </button>
        </div>
      </div>
      <PingModal isOpen={isPingOpen} onClose={() => setIsPingOpen(false)} onConfirm={(a, ip) => { sendCmd('TOGGLE_PING', { allow: a, target_ip: ip }); setIsPingOpen(false); }} />
      <WebBlockModal isOpen={isWebOpen} onClose={() => setIsWebOpen(false)} onConfirm={(url) => { sendCmd('BLOCK_WEB', { url }); setIsWebOpen(false); }} />
    </>
  );
};