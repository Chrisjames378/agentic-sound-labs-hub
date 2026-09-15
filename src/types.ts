export type OscType = "sine" | "square" | "sawtooth" | "triangle";

export type SynthCategory = "AI Modular" | "Custom Synth" | "Neural Processors" | "FM Synth";

export interface SynthPatch {
  id: string | number;
  name: string;
  category: SynthCategory;
  arch: string;
  desc: string;
  presets: number;
  icon: string; // Lucide icon name or fontawesome class
  status: "Online" | "Calibrated" | "Active" | "Optimized" | "Ready";
  created: string;
  oscType: OscType;
  filterFreq: number; // 100 to 10000 Hz
  resonance: number; // 0.1 to 20
  reverbMix: number; // 0 to 1
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // 0 to 1
  release: number; // seconds
  distortion?: number; // 0 to 1
  bpm?: number; // 60 to 200
  arpPattern?: "up" | "down" | "upDown" | "random" | "pentatonic";
  tags?: string[];
}

export type FilterCategory = "all" | SynthCategory;
