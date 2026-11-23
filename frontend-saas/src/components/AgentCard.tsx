import { Monitor, Wifi, WifiOff } from 'lucide-react';

interface Props {
  id: string;
  name: string;
  os: string;
  isOnline: boolean;
  onSelect: () => void;
}

export const AgentCard = ({ name, os, isOnline, onSelect }: Props) => {
  return (
    <div 
      onClick={onSelect}
      className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 cursor-pointer transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-brand-50 dark:bg-gray-700 rounded-lg">
          <Monitor className="text-brand-500" size={24} />
        </div>
        {isOnline ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
            <Wifi size={14} /> Online
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
            <WifiOff size={14} /> Offline
          </span>
        )}
      </div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{os}</p>
    </div>
  );
};