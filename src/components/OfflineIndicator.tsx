import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2.5 rounded-xl bg-amber-500/90 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-2xl border border-amber-400/50 animate-bounce">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>Offline Mode — Cached synths and local studio engine are active.</span>
    </div>
  );
};
