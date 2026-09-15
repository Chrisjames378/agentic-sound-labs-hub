import React, { useState } from "react";
import { X, Plus, Sliders } from "lucide-react";
import { OscType, SynthCategory, SynthPatch } from "../types";

interface AddSynthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSynth: (synth: SynthPatch) => void;
  onShowToast: (msg: string) => void;
}

export const AddSynthModal: React.FC<AddSynthModalProps> = ({
  isOpen,
  onClose,
  onAddSynth,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState("");
  const [category, setCategory] = useState<SynthCategory>("Custom Synth");
  const [arch, setArch] = useState("");
  const [desc, setDesc] = useState("");
  const [presets, setPresets] = useState(16);
  const [icon, setIcon] = useState("Sliders");
  const [oscType, setOscType] = useState<OscType>("sawtooth");
  const [filterFreq, setFilterFreq] = useState(1500);
  const [resonance, setResonance] = useState(3.0);
  const [reverbMix, setReverbMix] = useState(0.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !arch.trim() || !desc.trim()) return;

    const newSynth: SynthPatch = {
      id: String(Date.now()),
      name: name.trim(),
      category,
      arch: arch.trim(),
      desc: desc.trim(),
      presets: Number(presets),
      icon,
      status: "Online",
      created: new Date().toISOString().split("T")[0],
      oscType,
      filterFreq: Number(filterFreq),
      resonance: Number(resonance),
      reverbMix: Number(reverbMix),
      attack: 0.05,
      decay: 0.3,
      sustain: 0.6,
      release: 1.2,
      distortion: 0.0,
      tags: [category.toLowerCase(), arch.toLowerCase()],
    };

    onAddSynth(newSynth);
    onShowToast(`Registered synth "${newSynth.name}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-white">
              Register New Synth Creation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              Synth Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aether-Matrix 9000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SynthCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="AI Modular">AI Modular</option>
                <option value="Custom Synth">Custom Synth</option>
                <option value="Neural Processors">Neural Processors</option>
                <option value="FM Synth">FM Synth</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Architecture Type
              </label>
              <input
                type="text"
                required
                value={arch}
                onChange={(e) => setArch(e.target.value)}
                placeholder="e.g. FM / Granular"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the sonic character, neural prompt, or hardware topology..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Initial Waveform
              </label>
              <select
                value={oscType}
                onChange={(e) => setOscType(e.target.value as OscType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition capitalize"
              >
                <option value="sine">Sine</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Presets Count
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={presets}
                onChange={(e) => setPresets(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Register Synth
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
