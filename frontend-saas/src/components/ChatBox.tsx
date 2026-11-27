import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { socket } from '../lib/socket';

export const ChatBox = ({ agentId }: { agentId: string }) => {
  const [messages, setMessages] = useState<{sender: string, message: string}[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleChat = (data: any) => {
      if (data.agentId === agentId) setMessages(prev => [...prev, { sender: data.sender, message: data.message }]);
    };
    socket.on('receive_chat', handleChat);
    return () => { socket.off('receive_chat', handleChat); };
  }, [agentId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('send_chat', { agentId, message: input, sender: 'Admin' });
    setInput('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-xl flex flex-col h-96">
      <div className="p-4 border-b dark:border-slate-700"><h3 className="font-bold dark:text-white">Chat</h3></div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'Admin' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 dark:text-white'}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t dark:border-slate-700 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Mensaje..." className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-lg px-4 py-2 text-sm dark:text-white" />
        <button type="submit" className="bg-brand-500 text-white p-2 rounded-lg"><Send size={18} /></button>
      </form>
    </div>
  );
};