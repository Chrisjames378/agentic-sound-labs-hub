import React, { useState } from "react";
import { Sparkles, X, Wand2, ArrowRight, Loader2, Music, Check } from "lucide-react";
import { SynthPatch } from "../types";

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatchGenerated: (patch: SynthPatch, autoOpenStudio?: boolean) => void;
  onShowToast: (msg: string) => void;
  initialPrompt?: string;
}

const SAMPLE_PROMPTS = [
  "Crystalline ambient pad with slow sweeping filter and cathedral reverb",
  "Aggressive 80s cyberpunk acid bassline with distorted ladder filter",
  "Ethereal shimmer chime synth with dual envelope decay and wide delay",
  "Subterranean sub-bass drone with cross-modulation matrix",
  "Retro arcade 8-bit lead synth with fast vibrato and pulse modulation",
];

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPatchGenerated,
  onShowToast,
  initialPrompt = "",
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPatch, setGeneratedPatch] = useState<SynthPatch | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedPatch(null);

    try {
      const res = await fetch("/api/generate-synth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();
      if (data.patch) {
        const fullPatch: SynthPatch = {
          ...data.patch,
          id: String(Date.now()),
        };
        setGeneratedPatch(fullPatch);
        onShowToast(`AI Patch "${fullPatch.name}" generated!`);
      }
    } catch (err) {
      console.error("AI synth generation error:", err);
      onShowToast("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAndAudition = () => {
    if (!generatedPatch) return;
    onPatchGenerated(generatedPatch, true);
    onClose();
  };

  const handleAddOnly = () => {
    if (!generatedPatch) return;
    onPatchGenerated(generatedPatch, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">
                AI Synth Architect
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Generate custom DSP parameters via Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Sonic Description / Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={3}
                placeholder="Describe the desired sound timbre, filter dynamics, acoustic texture, or music genre..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Prompt Inspiration Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sample)}
                    className="text-xs text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl px-3 py-1.5 transition text-left"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing DSP Topology...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Custom Synth Patch</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview */}
          {generatedPatch && (
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Generated Patch Result
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {generatedPatch.name}
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    {generatedPatch.arch}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {generatedPatch.desc}
              </p>

              <div className="grid grid-cols-4 gap-2 text-[11px] font-mono bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Waveform</span>
                  <span className="font-bold text-emerald-400 capitalize">
                    {generatedPatch.oscType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cutoff</span>
                  <span className="font-bold text-teal-400">
                    {generatedPatch.filterFreq} Hz
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Resonance</span>
                  <span className="font-bold text-cyan-400">
                    {generatedPatch.resonance}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Reverb</span>
                  <span className="font-bold text-indigo-400">
                    {Math.round(generatedPatch.reverbMix * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleAddAndAudition}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Music className="w-4 h-4" />
                  <span>Add & Audition in Studio</span>
                </button>
                <button
                  onClick={handleAddOnly}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700/60"
                >
                  Save to Archive
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
