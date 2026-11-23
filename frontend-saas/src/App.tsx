import { useState } from 'react';
import { useAgent } from './context/AgentContext';
import { AgentSelector } from './components/AgentSelector';
import { Sidebar } from './components/Sidebar';
import { ControlPanel } from './components/ControlPanel';
import { ScreenViewer } from './components/ScreenViewer';
import { ChatBox } from './components/ChatBox';
import { FileTransfer } from './components/FileTransfer';
import { LogsTable } from './components/LogsTable';
import { ArrowLeft } from 'lucide-react';

function App() {
  const { selectedAgent, clearAgent } = useAgent();
  const [showScreen, setShowScreen] = useState(false);

  // VISTA GENERAL (Dashboard)
  if (!selectedAgent) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-[#0B0F19]">
        <Sidebar />
        {/* pb-20 para que el contenido no quede oculto por la barra inferior en móvil */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <header className="mb-6 md:mb-8 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Vista General</h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">Selecciona un dispositivo para gestionarlo.</p>
          </header>
          <AgentSelector />
        </main>
      </div>
    );
  }

  // VISTA DE CONTROL DEL AGENTE
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-[#0B0F19]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={clearAgent} 
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div className="truncate">
              <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate">PC: {selectedAgent.name}</h1>
              <p className="text-xs text-slate-500 truncate">ID: {selectedAgent.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full self-start md:self-auto">
            <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${selectedAgent.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300">
              {selectedAgent.isOnline ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 order-2 xl:order-1 space-y-4">
            <LogsTable agentId={selectedAgent.id} />
          </div>
          <div className="xl:col-span-2 order-1 xl:order-2 space-y-6">
            <ControlPanel agentId={selectedAgent.id} onShowScreen={() => setShowScreen(true)} />
            {showScreen && <ScreenViewer agentId={selectedAgent.id} onClose={() => setShowScreen(false)} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChatBox agentId={selectedAgent.id} />
              <FileTransfer agentId={selectedAgent.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default App;