import { useState } from 'react';
import { useAgent } from './context/AgentContext';
import { AgentSelector } from './components/AgentSelector';
import { Sidebar } from './components/Sidebar';
import { ControlPanel } from './components/ControlPanel';
import { ScreenViewer } from './components/ScreenViewer';
import { ChatBox } from './components/ChatBox';
import { FileTransfer } from './components/FileTransfer';
import { LogsTable } from './components/LogsTable';

function App() {
  const { selectedAgent, clearAgent } = useAgent();
  const [showScreen, setShowScreen] = useState(false);

  if (!selectedAgent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
        <AgentSelector />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-500">Dispositivo: {selectedAgent.name}</h1>
            <p className="text-slate-500 text-sm mt-1">ID: {selectedAgent.id}</p>
          </div>
          <button onClick={clearAgent} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
            Cambiar de PC
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-4">
            <LogsTable agentId={selectedAgent.id} />
          </div>
          <div className="xl:col-span-2 space-y-6">
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