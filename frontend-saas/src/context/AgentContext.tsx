import { createContext, useContext, useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  os: string;
  isOnline: boolean;
}

interface AgentContextType {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent) => void;
  clearAgent: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAgent, setSelectedAgentState] = useState<Agent | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('monitor_agent');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verificar si el agente guardado tiene más de 7 días (604800000 ms)
        const now = Date.now();
        if (parsed.timestamp && (now - parsed.timestamp > 604800000)) {
          localStorage.removeItem('monitor_agent');
        } else {
          setSelectedAgentState(parsed.agent);
        }
      } catch (e) {
        localStorage.removeItem('monitor_agent');
      }
    }
  }, []);

  const setSelectedAgent = (agent: Agent) => {
    setSelectedAgentState(agent);
    // Guardamos el agente y la fecha actual
    localStorage.setItem('monitor_agent', JSON.stringify({ agent, timestamp: Date.now() }));
  };

  const clearAgent = () => {
    setSelectedAgentState(null);
    localStorage.removeItem('monitor_agent');
  };

  return (
    <AgentContext.Provider value={{ selectedAgent, setSelectedAgent, clearAgent }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgent debe usarse dentro de AgentProvider');
  return context;
};