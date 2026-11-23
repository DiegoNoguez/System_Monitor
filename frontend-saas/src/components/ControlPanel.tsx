import { Lock, Unlock, Power, Globe, Wifi, MonitorPlay } from 'lucide-react';
import { socket, AGENT_ID } from '../lib/socket';

interface Props {
  onShowScreen: () => void;
}

export const ControlPanel = ({ onShowScreen }: Props) => {
  const sendCommand = (command: string, payload?: any) => {
    socket.emit('send_command', { agentId: AGENT_ID, command, payload });
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Panel de Control</h2>
        <button 
          onClick={onShowScreen}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)]"
        >
          <MonitorPlay size={18} /> Ver Pantalla
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => sendCommand('BLOCK_INPUT')} className="group flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-danger-500/10 text-slate-600 dark:text-slate-400 hover:text-danger-500 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-danger-500/50">
          <Lock size={28} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold">Bloquear</span>
        </button>

        <button onClick={() => sendCommand('UNBLOCK_INPUT')} className="group flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-success-500/10 text-slate-600 dark:text-slate-400 hover:text-success-500 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-success-500/50">
          <Unlock size={28} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold">Desbloquear</span>
        </button>

        <button onClick={() => sendCommand('BLOCK_WEB', { url: 'facebook.com' })} className="group flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-warning-500/10 text-slate-600 dark:text-slate-400 hover:text-warning-500 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-warning-500/50">
          <Globe size={28} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold">Bloquear Web</span>
        </button>

        <button onClick={() => sendCommand('TOGGLE_PING', { allow: false })} className="group flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-500/10 text-slate-600 dark:text-slate-400 hover:text-orange-500 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-orange-500/50">
          <Wifi size={28} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold">Denegar Ping</span>
        </button>

        <button onClick={() => sendCommand('SHUTDOWN')} className="col-span-2 flex items-center justify-center p-4 mt-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl transition-all shadow-[0_4px_20px_rgba(244,63,94,0.4)] hover:shadow-[0_4px_30px_rgba(244,63,94,0.6)] transform hover:-translate-y-0.5">
          <Power size={22} className="mr-3" />
          <span className="font-bold tracking-wide">Apagar PC Remotamente</span>
        </button>
      </div>
    </div>
  );
};