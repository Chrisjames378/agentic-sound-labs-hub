import React from "react";
import { AudioWaveform, Download, Upload, Plus, Sparkles, ExternalLink, LayoutGrid } from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

interface NavbarProps {
  onOpenAiGenerator: () => void;
  onOpenAddSynth: () => void;
  onExportArchive: () => void;
  onImportArchive: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WORKSPACE_URL = "https://workspace4-agentic-sound-labs.ai.studio";

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAiGenerator,
  onOpenAddSynth,
  onExportArchive,
  onImportArchive,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-xl">
            <AudioWaveform className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Agentic Sound Labs
            </span>
            <span className="block text-xs text-slate-400 font-mono">
              AI & Custom Sound Architecture
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* PWA In-App Install Prompt */}
          <PWAInstallButton />

          {/* External Workspace Link */}
          <a
            href={WORKSPACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Agentic Sound Labs Workspace"
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold transition hover:border-teal-400/60 shadow-sm"
          >
            <LayoutGrid className="w-4 h-4 text-teal-400" />
            <span className="hidden md:inline">Open Workspace App</span>
            <span className="md:hidden">Workspace</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={onOpenAiGenerator}
            className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold transition group shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">AI Synth Generator</span>
            <span className="sm:hidden">AI Generator</span>
          </button>

          <button
            onClick={onExportArchive}
            title="Export JSON Archive"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export JSON</span>
          </button>

          <label
            title="Import JSON Archive"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportArchive}
              className="hidden"
            />
          </label>

          <button
            onClick={onOpenAddSynth}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Synth</span>
          </button>
        </div>
      </div>
    </header>
  );
};
