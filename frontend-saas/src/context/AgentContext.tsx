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
        setSelectedAgentState(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('monitor_agent');
      }
    }
  }, []);

  const setSelectedAgent = (agent: Agent) => {
    setSelectedAgentState(agent);
    localStorage.setItem('monitor_agent', JSON.stringify(agent));
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