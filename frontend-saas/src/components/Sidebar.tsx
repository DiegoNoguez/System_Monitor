import { Monitor, Shield, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAgent } from '../context/AgentContext';

export const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { clearAgent, selectedAgent } = useAgent();

  return (
    <aside className="fixed bottom-0 w-full h-16 md:static md:w-64 md:h-screen bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-row md:flex-col transition-colors z-40">
      {/* Logo (Oculto en móvil) */}
      <div className="hidden md:flex p-6 items-center gap-3">
        <Shield className="text-brand-500 w-8 h-8" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">MonitorSys</h1>
      </div>

      {/* Navegación */}
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 md:px-4 md:space-y-2 items-center md:items-stretch">
        <a href="#" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-2 bg-brand-500 text-white rounded-lg md:rounded-lg font-medium shadow-none md:shadow-md shadow-brand-500/20">
          <Monitor size={20} /> 
          <span className="text-[10px] md:text-base">Dispositivos</span>
        </a>
        
        {selectedAgent && (
           <button onClick={clearAgent} className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors">
            <LogOut size={20} /> 
            <span className="text-[10px] md:text-base">Salir</span>
          </button>
        )}
      </nav>

      {/* Botón de Tema */}
      <div className="p-2 md:p-4 md:border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <button 
          onClick={toggleTheme}
          className="flex flex-col md:flex-row items-center gap-1 md:gap-3 w-full md:px-4 md:py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-[10px] md:text-base">{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
        </button>
      </div>
    </aside>
  );
};