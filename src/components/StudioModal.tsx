import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Play,
  Square,
  Save,
  Volume2,
  Mic,
  Download,
  Activity,
  Music,
  Sliders,
  Sparkles,
  Zap,
  RotateCcw
} from "lucide-react";
import { OscType, SynthPatch } from "../types";
import { synthEngine } from "../audio/synthEngine";

interface StudioModalProps {
  synth: SynthPatch | null;
  onClose: () => void;
  onSavePatch: (updatedSynth: SynthPatch) => void;
  onShowToast: (msg: string) => void;
}

const PIANO_KEYS = [
  { note: "C3", label: "C3", key: "z", isBlack: false },
  { note: "C#3", label: "C#3", key: "s", isBlack: true },
  { note: "D3", label: "D3", key: "x", isBlack: false },
  { note: "D#3", label: "D#3", key: "d", isBlack: true },
  { note: "E3", label: "E3", key: "c", isBlack: false },
  { note: "F3", label: "F3", key: "v", isBlack: false },
  { note: "F#3", label: "F#3", key: "g", isBlack: true },
  { note: "G3", label: "G3", key: "b", isBlack: false },
  { note: "G#3", label: "G#3", key: "h", isBlack: true },
  { note: "A3", label: "A3", key: "n", isBlack: false },
  { note: "A#3", label: "A#3", key: "j", isBlack: true },
  { note: "B3", label: "B3", key: "m", isBlack: false },
  { note: "C4", label: "C4", key: "a", isBlack: false },
  { note: "C#4", label: "C#4", key: "w", isBlack: true },
  { note: "D4", label: "D4", key: "s", isBlack: false },
  { note: "D#4", label: "D#4", key: "e", isBlack: true },
  { note: "E4", label: "E4", key: "d", isBlack: false },
  { note: "F4", label: "F4", key: "f", isBlack: false },
  { note: "F#4", label: "F#4", key: "t", isBlack: true },
  { note: "G4", label: "G4", key: "g", isBlack: false },
  { note: "G#4", label: "G#4", key: "y", isBlack: true },
  { note: "A4", label: "A4", key: "h", isBlack: false },
  { note: "A#4", label: "A#4", key: "u", isBlack: true },
  { note: "B4", label: "B4", key: "j", isBlack: false },
  { note: "C5", label: "C5", key: "k", isBlack: false },
];

export const StudioModal: React.FC<StudioModalProps> = ({
  synth,
  onClose,
  onSavePatch,
  onShowToast,
}) => {
  if (!synth) return null;

  // Local Synth Parameter State
  const [oscType, setOscType] = useState<OscType>(synth.oscType);
  const [filterFreq, setFilterFreq] = useState<number>(synth.filterFreq);
  const [resonance, setResonance] = useState<number>(synth.resonance);
  const [reverbMix, setReverbMix] = useState<number>(synth.reverbMix);
  const [attack, setAttack] = useState<number>(synth.attack ?? 0.05);
  const [decay, setDecay] = useState<number>(synth.decay ?? 0.3);
  const [sustain, setSustain] = useState<number>(synth.sustain ?? 0.6);
  const [release, setRelease] = useState<number>(synth.release ?? 1.2);
  const [distortion, setDistortion] = useState<number>(synth.distortion ?? 0.0);

  // Arpeggiator & Recording State
  const [isArpPlaying, setIsArpPlaying] = useState(false);
  const [arpPattern, setArpPattern] = useState<"up" | "down" | "upDown" | "random" | "pentatonic">(synth.arpPattern ?? "upDown");
  const [bpm, setBpm] = useState<number>(synth.bpm ?? 120);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize and load patch parameters into synthEngine on modal open
  useEffect(() => {
    async function setupAudio() {
      await synthEngine.init();
      synthEngine.loadPatch({
        ...synth,
        oscType,
        filterFreq,
        resonance,
        reverbMix,
        attack,
        decay,
        sustain,
        release,
        distortion,
      });
    }
    setupAudio();

    // Start Oscilloscope animation loop
    startVisualizer();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      synthEngine.stopArp();
    };
  }, [synth]);

  // Handle computer keyboard shortcuts for piano notes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const keyObj = PIANO_KEYS.find((k) => k.key.toLowerCase() === e.key.toLowerCase());
      if (keyObj) {
        playNote(keyObj.note);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleParamChange = (updates: {
    oscType?: OscType;
    filterFreq?: number;
    resonance?: number;
    reverbMix?: number;
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    distortion?: number;
  }) => {
    if (updates.oscType) setOscType(updates.oscType);
    if (updates.filterFreq !== undefined) setFilterFreq(updates.filterFreq);
    if (updates.resonance !== undefined) setResonance(updates.resonance);
    if (updates.reverbMix !== undefined) setReverbMix(updates.reverbMix);
    if (updates.attack !== undefined) setAttack(updates.attack);
    if (updates.decay !== undefined) setDecay(updates.decay);
    if (updates.sustain !== undefined) setSustain(updates.sustain);
    if (updates.release !== undefined) setRelease(updates.release);
    if (updates.distortion !== undefined) setDistortion(updates.distortion);

    synthEngine.updateParams(updates);
  };

  const playNote = (note: string) => {
    if (!synthEngine.isInitialized) {
      synthEngine.init().then(() => {
        synthEngine.playNote(note, "8n");
      });
    } else {
      synthEngine.playNote(note, "8n");
    }
    setActiveNote(note);
    setTimeout(() => setActiveNote(null), 250);
  };

  const toggleArp = () => {
    if (isArpPlaying) {
      synthEngine.stopArp();
      setIsArpPlaying(false);
    } else {
      setIsArpPlaying(true);
      synthEngine.startArp(arpPattern, bpm, (note) => {
        setActiveNote(note);
        setTimeout(() => setActiveNote(null), 150);
      });
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const blob = await synthEngine.stopRecording();
      setIsRecording(false);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onShowToast("Audio performance recorded!");
      }
    } else {
      await synthEngine.startRecording();
      setIsRecording(true);
      onShowToast("Recording started... Play notes or trigger the arpeggiator!");
    }
  };

  const handleSavePatchClick = () => {
    const updatedPatch: SynthPatch = {
      ...synth,
      oscType,
      filterFreq,
      resonance,
      reverbMix,
      attack,
      decay,
      sustain,
      release,
      distortion,
      bpm,
      arpPattern,
      presets: synth.presets + 1,
    };
    onSavePatch(updatedPatch);
    onShowToast(`Saved patch settings to "${synth.name}"!`);
  };

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      ctx.fillStyle = "rgba(2, 6, 23, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const waveform = synthEngine.getWaveformData();
      if (!waveform || waveform.length === 0) return;

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = canvas.width / waveform.length;
      let x = 0;

      for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i];
        const y = (v * canvas.height) / 2 + canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    render();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white tracking-tight">
                {synth.name}
              </h2>
              <span className="text-xs text-emerald-400 font-mono">
                {synth.category} // {synth.arch}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSavePatchClick}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700/50"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Patch</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Studio Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
            {synth.desc}
          </p>

          {/* Visualizer Canvas */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-36 flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={144}
              className="w-full h-full"
            />
            <div className="absolute top-3 left-4 pointer-events-none flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                Real-Time Oscilloscope Output
              </span>
            </div>
            {activeNote && (
              <div className="absolute top-3 right-4 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold animate-pulse">
                Note: {activeNote}
              </div>
            )}
          </div>

          {/* Oscillator Topology Selector */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block font-mono">
                Oscillator Waveform Topology
              </span>
              <span className="text-xs text-slate-500">
                Select fundamental raw generator shape
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {(["sine", "square", "sawtooth", "triangle"] as OscType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleParamChange({ oscType: type })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition capitalize ${
                    oscType === type
                      ? "bg-emerald-500 text-slate-950 border border-emerald-400 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Core DSP Control Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cutoff */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Filter Cutoff</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {filterFreq} Hz
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={filterFreq}
                onChange={(e) =>
                  handleParamChange({ filterFreq: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Resonance / Q */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Resonance / Q</span>
                <span className="font-mono text-teal-400 font-bold">
                  {resonance.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={resonance}
                onChange={(e) =>
                  handleParamChange({ resonance: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Reverb Wet */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Reverb Wet</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round(reverbMix * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={reverbMix}
                onChange={(e) =>
                  handleParamChange({ reverbMix: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Distortion */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Distortion Overdrive</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {Math.round(distortion * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={distortion}
                onChange={(e) =>
                  handleParamChange({ distortion: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Envelope ADSR Controls */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block">
              Envelope Generator (ADSR)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Attack</span>
                  <span className="font-mono text-emerald-400">{attack}s</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="2.0"
                  step="0.02"
                  value={attack}
                  onChange={(e) =>
                    handleParamChange({ attack: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Decay</span>
                  <span className="font-mono text-teal-400">{decay}s</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="2.0"
                  step="0.05"
                  value={decay}
                  onChange={(e) =>
                    handleParamChange({ decay: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Sustain</span>
                  <span className="font-mono text-cyan-400">
                    {Math.round(sustain * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={sustain}
                  onChange={(e) =>
                    handleParamChange({ sustain: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Release</span>
                  <span className="font-mono text-indigo-400">{release}s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.1"
                  value={release}
                  onChange={(e) =>
                    handleParamChange({ release: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Arpeggiator & Recorder Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arpeggiator Panel */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Neural Arpeggiator
                </span>
                <button
                  onClick={toggleArp}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isArpPlaying
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  }`}
                >
                  {isArpPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Sequence</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Arpeggiator</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Pattern</label>
                  <select
                    value={arpPattern}
                    onChange={(e) => setArpPattern(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="up">Up Scale</option>
                    <option value="down">Down Scale</option>
                    <option value="upDown">Up-Down</option>
                    <option value="random">Random Arp</option>
                    <option value="pentatonic">Pentatonic Ambient</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Tempo: <span className="font-mono text-emerald-400">{bpm} BPM</span>
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    step="2"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Audio Recorder Panel */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Audio Performance Recorder
                </span>
                <button
                  onClick={toggleRecording}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-red-400" />
                  <span>{isRecording ? "Stop Recording" : "Record Audio"}</span>
                </button>
              </div>

              {audioUrl ? (
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <audio controls src={audioUrl} className="h-8 w-48 sm:w-60" />
                  <a
                    href={audioUrl}
                    download={`${synth.name.replace(/\s+/g, "_")}_Performance.webm`}
                    className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 hover:bg-emerald-400 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Click "Record Audio" to record your live play or arpeggiator sequence, then download the audio file directly.
                </p>
              )}
            </div>
          </div>

          {/* Virtual Keyboard Test Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Interactive Piano Keyboard (Play with Mouse or Keyboard)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Keys: [A] [S] [D] [F] [G] [H] [J] [K]
              </span>
            </div>

            <div className="flex items-end overflow-x-auto p-4 bg-slate-950 rounded-2xl border border-slate-800 select-none space-x-1">
              {PIANO_KEYS.map((keyObj) => {
                const isActive = activeNote === keyObj.note;

                if (keyObj.isBlack) {
                  return (
                    <button
                      key={keyObj.note}
                      onClick={() => playNote(keyObj.note)}
                      className={`h-20 w-8 sm:w-10 -mx-3 sm:-mx-4 z-10 rounded-b-xl border flex flex-col justify-end items-center pb-2 text-[10px] font-mono font-bold transition ${
                        isActive
                          ? "bg-emerald-400 text-slate-950 border-emerald-300"
                          : "bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      <span>{keyObj.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={keyObj.note}
                    onClick={() => playNote(keyObj.note)}
                    className={`h-32 w-10 sm:w-12 rounded-b-xl border flex flex-col justify-end items-center pb-3 text-xs font-mono font-bold transition ${
                      isActive
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 mb-1 uppercase font-mono">
                      [{keyObj.key}]
                    </span>
                    <span>{keyObj.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-mono">
            High-precision DSP engine powered by Tone.js & Web Audio API
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
