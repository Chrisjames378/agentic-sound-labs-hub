import * as Tone from "tone";
import { OscType, SynthPatch } from "../types";

class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private filter: Tone.Filter | null = null;
  private reverb: Tone.Reverb | null = null;
  private distortion: Tone.Distortion | null = null;
  private analyser: Tone.Analyser | null = null;
  private recorder: Tone.Recorder | null = null;

  public isInitialized = false;
  public isRecording = false;
  private arpSequenceId: number | null = null;

  async init() {
    if (this.isInitialized) return;
    await Tone.start();

    this.analyser = new Tone.Analyser("waveform", 1024);
    
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.3
    });
    await this.reverb.generate();

    this.distortion = new Tone.Distortion(0.0);

    this.filter = new Tone.Filter({
      frequency: 1500,
      type: "lowpass",
      Q: 2.5
    });

    this.recorder = new Tone.Recorder();

    // Create polyphonic synth for rich chord/note playback
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.5,
        release: 1.2
      }
    });

    // Chain node connections
    this.synth.chain(
      this.distortion,
      this.filter,
      this.reverb,
      this.analyser,
      this.recorder,
      Tone.Destination
    );

    this.isInitialized = true;
  }

  loadPatch(patch: SynthPatch) {
    if (!this.isInitialized || !this.synth || !this.filter || !this.reverb || !this.distortion) return;

    this.synth.set({
      oscillator: { type: patch.oscType },
      envelope: {
        attack: patch.attack ?? 0.05,
        decay: patch.decay ?? 0.2,
        sustain: patch.sustain ?? 0.5,
        release: patch.release ?? 1.2
      }
    });

    this.filter.frequency.rampTo(patch.filterFreq, 0.05);
    this.filter.Q.rampTo(patch.resonance, 0.05);
    this.reverb.wet.rampTo(patch.reverbMix, 0.05);
    this.distortion.distortion = patch.distortion ?? 0.0;
  }

  updateParams(params: {
    oscType?: OscType;
    filterFreq?: number;
    resonance?: number;
    reverbMix?: number;
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    distortion?: number;
  }) {
    if (!this.isInitialized) return;

    if (params.oscType && this.synth) {
      this.synth.set({ oscillator: { type: params.oscType } });
    }

    if (this.synth && (params.attack !== undefined || params.decay !== undefined || params.sustain !== undefined || params.release !== undefined)) {
      this.synth.set({
        envelope: {
          attack: params.attack ?? 0.05,
          decay: params.decay ?? 0.2,
          sustain: params.sustain ?? 0.5,
          release: params.release ?? 1.2
        }
      });
    }

    if (params.filterFreq !== undefined && this.filter) {
      this.filter.frequency.rampTo(params.filterFreq, 0.05);
    }
    if (params.resonance !== undefined && this.filter) {
      this.filter.Q.rampTo(params.resonance, 0.05);
    }
    if (params.reverbMix !== undefined && this.reverb) {
      this.reverb.wet.rampTo(params.reverbMix, 0.05);
    }
    if (params.distortion !== undefined && this.distortion) {
      this.distortion.distortion = params.distortion;
    }
  }

  playNote(note: string, duration = "8n") {
    if (!this.isInitialized || !this.synth) return;
    try {
      this.synth.triggerAttackRelease(note, duration);
    } catch (e) {
      console.warn("Audio trigger error:", e);
    }
  }

  triggerAttack(note: string) {
    if (!this.isInitialized || !this.synth) return;
    try {
      this.synth.triggerAttack(note);
    } catch (e) {
      console.warn("Trigger attack error:", e);
    }
  }

  triggerRelease(note: string) {
    if (!this.isInitialized || !this.synth) return;
    try {
      this.synth.triggerRelease(note);
    } catch (e) {
      console.warn("Trigger release error:", e);
    }
  }

  getWaveformData(): Float32Array {
    if (!this.analyser) return new Float32Array(0);
    return this.analyser.getValue() as Float32Array;
  }

  async startRecording() {
    if (!this.isInitialized || !this.recorder) return;
    if (this.recorder.state === "started") return;
    await this.recorder.start();
    this.isRecording = true;
  }

  async stopRecording(): Promise<Blob | null> {
    if (!this.recorder || this.recorder.state !== "started") return null;
    this.isRecording = false;
    const recording = await this.recorder.stop();
    return recording;
  }

  startArp(
    pattern: "up" | "down" | "upDown" | "random" | "pentatonic" = "upDown",
    bpm = 120,
    onNotePlay?: (note: string) => void
  ) {
    this.stopArp();

    let notes = ["C4", "E4", "G4", "B4", "C5", "B4", "G4", "E4"];
    if (pattern === "up") notes = ["C4", "E4", "G4", "B4", "C5"];
    if (pattern === "down") notes = ["C5", "B4", "G4", "E4", "C4"];
    if (pattern === "pentatonic") notes = ["C4", "D4", "F4", "G4", "A4", "C5", "A4", "G4"];

    let index = 0;
    const intervalMs = (60 / bpm) * 1000 * 0.5; // sixteenths or eighths

    this.arpSequenceId = window.setInterval(() => {
      let currentNote = notes[index];
      if (pattern === "random") {
        currentNote = notes[Math.floor(Math.random() * notes.length)];
      } else {
        index = (index + 1) % notes.length;
      }
      this.playNote(currentNote, "16n");
      if (onNotePlay) onNotePlay(currentNote);
    }, intervalMs);
  }

  stopArp() {
    if (this.arpSequenceId !== null) {
      clearInterval(this.arpSequenceId);
      this.arpSequenceId = null;
    }
  }
}

export const synthEngine = new AudioEngine();
