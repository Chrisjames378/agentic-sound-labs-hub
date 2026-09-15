import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        title="Install Agentic Sound Labs App"
        className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 active:scale-95"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Install on iOS Home Screen"
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden sm:inline">Install on iOS</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Add Sound Labs to your home screen</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="flex items-start space-x-2.5">
                  <span className="font-bold text-emerald-400">1.</span>
                  <span>Tap the <strong className="text-white">Share <Share className="w-3 h-3 inline text-emerald-400" /></strong> icon in Safari bottom bar.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="font-bold text-emerald-400">2.</span>
                  <span>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
