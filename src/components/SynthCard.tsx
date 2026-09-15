import React, { useState } from "react";
import {
  Brain,
  Cpu,
  Wand2,
  Sliders,
  Radio,
  Activity,
  AudioWaveform,
  Play,
  Trash2,
  Maximize2,
  Tag,
  Volume2
} from "lucide-react";
import { SynthPatch } from "../types";
import { synthEngine } from "../audio/synthEngine";

interface SynthCardProps {
  synth: SynthPatch;
  onOpenStudio: (synth: SynthPatch) => void;
  onDelete: (id: string | number) => void;
  onPlayQuickTest: (synth: SynthPatch) => void;
}

export const SynthCard: React.FC<SynthCardProps> = ({
  synth,
  onOpenStudio,
  onDelete,
  onPlayQuickTest,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "brain":
      case "Brain":
        return <Brain className="w-5 h-5 text-emerald-400" />;
      case "microchip":
      case "Cpu":
        return <Cpu className="w-5 h-5 text-teal-400" />;
      case "wand-magic-sparkles":
      case "Wand2":
        return <Wand2 className="w-5 h-5 text-cyan-400" />;
      case "sliders":
      case "Sliders":
        return <Sliders className="w-5 h-5 text-indigo-400" />;
      case "radio":
      case "Radio":
        return <Radio className="w-5 h-5 text-purple-400" />;
      case "Activity":
        return <Activity className="w-5 h-5 text-pink-400" />;
      default:
        return <AudioWaveform className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleQuickPlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    await onPlayQuickTest(synth);
    setTimeout(() => setIsPlaying(false), 800);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-emerald-500/30 transition">
            {getIconComponent(synth.icon)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950 text-emerald-400 border border-emerald-500/20 font-mono">
              {synth.category}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(synth.id);
              }}
              title="Delete Synth"
              className="text-slate-600 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Name & Arch */}
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition">
            {synth.name}
          </h3>
          <span className="inline-block text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
            {synth.arch}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {synth.desc}
        </p>

        {/* Tags */}
        {synth.tags && synth.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {synth.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-mono">
          <span>{synth.presets} Presets</span> •{" "}
          <span className="text-emerald-400 font-semibold">{synth.status}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleQuickPlay}
            title="Quick Play Test Note"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
              isPlaying
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
          >
            {isPlaying ? (
              <Volume2 className="w-4 h-4 animate-bounce" />
            ) : (
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            )}
          </button>

          <button
            onClick={() => onOpenStudio(synth)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
