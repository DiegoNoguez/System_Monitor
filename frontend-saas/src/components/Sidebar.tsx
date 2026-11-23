import { Monitor, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
      <div className="p-6 flex items-center gap-3">
        <Shield className="text-brand-500 w-8 h-8" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">MonitorSys</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {/* Solo dejamos Dispositivos */}
        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-brand-500 text-white rounded-lg font-medium shadow-md shadow-brand-500/20">
          <Monitor size={20} /> Dispositivos
        </a>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>
    </aside>
  );
};