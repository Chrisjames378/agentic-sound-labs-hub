import React, { useState } from "react";
import { Cpu, Bot, Sliders, Zap, Sparkles, ArrowRight, ExternalLink, LayoutGrid } from "lucide-react";
import { SynthPatch } from "../types";
import { WORKSPACE_URL } from "./Navbar";

interface HeroSectionProps {
  synths: SynthPatch[];
  onQuickGenerate: (prompt: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  synths,
  onQuickGenerate,
}) => {
  const [promptInput, setPromptInput] = useState("");

  const totalSynths = synths.length;
  const aiSynths = synths.filter((s) => s.category === "AI Modular").length;
  const customSynths = synths.filter((s) => s.category === "Custom Synth").length;
  const fmSynths = synths.filter((s) => s.category === "FM Synth" || s.category === "Neural Processors").length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    onQuickGenerate(promptInput.trim());
    setPromptInput("");
  };

  return (
    <section className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800/80 p-6 md:p-10 overflow-hidden shadow-2xl">
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>Autonomous Audio Generation & Custom DSP Synthesis</span>
          </div>

          <a
            href={WORKSPACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-mono transition"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-teal-400" />
            <span>Workspace Webapp</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Where AI Intelligence Meets{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Sonic Architecture
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Audition, design, and inspect your custom-built algorithmic synths, generative agentic sound modules, and hardware DSP emulations with real-time Web Audio synthesis.
          </p>
        </div>

        {/* Quick Prompt Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <div className="relative flex-grow">
            <Sparkles className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. Crystalline ambient pad with sweeping resonance..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center space-x-1.5 whitespace-nowrap shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <span>Design Patch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Stats bar */}
        <div className="pt-2 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white font-mono">{totalSynths}</span>
            <span className="text-slate-400">Total Synths</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <Bot className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-white font-mono">{aiSynths}</span>
            <span className="text-slate-400">AI Modular Models</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white font-mono">{customSynths}</span>
            <span className="text-slate-400">Custom Synths</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white font-mono">{fmSynths}</span>
            <span className="text-slate-400">Processors & FM</span>
          </div>
        </div>
      </div>
    </section>
  );
};
