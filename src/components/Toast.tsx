import React, { useEffect } from "react";
import { Check, X } from "lucide-react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom duration-300">
      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/30">
        <Check className="w-4 h-4" />
      </div>
      <span className="text-xs sm:text-sm font-medium pr-2">{message}</span>
      <button
        onClick={onClose}
        className="text-slate-500 hover:text-slate-300 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
