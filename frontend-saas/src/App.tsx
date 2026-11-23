import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { AgentCard } from './components/AgentCard';
import { ControlPanel } from './components/ControlPanel';
import { ScreenViewer } from './components/ScreenViewer';
import { ChatBox } from './components/ChatBox';
import { FileTransfer } from './components/FileTransfer';
import { LogsTable } from './components/LogsTable';
import { AGENT_ID } from './lib/socket';

function App() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(AGENT_ID);
  const [showScreen, setShowScreen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-500">
            Dispositivos Remotos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona y monitorea tus equipos en tiempo real.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Lista de Agentes */}
          <div className="xl:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Tus Equipos</h2>
            <AgentCard 
              id={AGENT_ID}
              name="Laptop de Desarrollo" 
              os="Linux (Wayland)" 
              isOnline={true} 
              onSelect={() => setSelectedAgent(AGENT_ID)}
            />
            <LogsTable />
          </div>

          {/* Columna Central/Derecha: Panel de Control y Pantalla */}
          <div className="xl:col-span-2 space-y-6">
            {selectedAgent && (
              <>
                <ControlPanel onShowScreen={() => setShowScreen(true)} />
                
                {/* Si se hace clic en "Ver Pantalla", se muestra el visor */}
                {showScreen && <ScreenViewer onClose={() => setShowScreen(false)} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChatBox />
                  <FileTransfer />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;