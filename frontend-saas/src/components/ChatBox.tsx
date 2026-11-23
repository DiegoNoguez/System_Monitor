import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { socket } from '../lib/socket';

interface Props {
  agentId: string;
}

export const ChatBox = ({ agentId }: Props) => {
  const [messages, setMessages] = useState<{sender: string, message: string}[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleReceiveChat = (data: any) => {
      if (data.agentId === agentId) {
        setMessages(prev => [...prev, { sender: data.sender, message: data.message }]);
      }
    };

    socket.on('receive_chat', handleReceiveChat);
    return () => { socket.off('receive_chat', handleReceiveChat); };
  }, [agentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    socket.emit('send_chat', { agentId, message: input, sender: 'Admin' });
    setInput('');
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-96">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="font-bold text-slate-800 dark:text-white">Chat con el Agente</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 && <p className="text-center text-slate-400 text-sm">Envía un mensaje para iniciar...</p>}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'Admin' ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
        />
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-lg transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};