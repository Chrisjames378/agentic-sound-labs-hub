import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Algorithmic fallback generator when Gemini API Key is missing or unavailable
function generateAlgorithmicPatch(prompt: string) {
  const p = prompt.toLowerCase();
  
  let oscType: "sine" | "square" | "sawtooth" | "triangle" = "sine";
  if (p.includes("bass") || p.includes("distort") || p.includes("lead") || p.includes("cyber")) {
    oscType = "sawtooth";
  } else if (p.includes("retro") || p.includes("8bit") || p.includes("game") || p.includes("hollow")) {
    oscType = "square";
  } else if (p.includes("flute") || p.includes("soft") || p.includes("organ") || p.includes("mellow")) {
    oscType = "triangle";
  } else if (p.includes("space") || p.includes("ambient") || p.includes("pad") || p.includes("sine")) {
    oscType = "sine";
  }

  let filterFreq = 1500;
  if (p.includes("dark") || p.includes("sub") || p.includes("bass")) filterFreq = 450;
  if (p.includes("bright") || p.includes("lead") || p.includes("crisp")) filterFreq = 4500;
  if (p.includes("ambient") || p.includes("pad")) filterFreq = 2200;

  let resonance = 2.5;
  if (p.includes("acid") || p.includes("squelch") || p.includes("resonant")) resonance = 9.5;

  let reverbMix = 0.35;
  if (p.includes("space") || p.includes("ambient") || p.includes("ethereal") || p.includes("cathedral")) reverbMix = 0.75;

  let category: "AI Modular" | "Custom Synth" | "Neural Processors" = "AI Modular";
  if (p.includes("neural") || p.includes("fx") || p.includes("processor")) category = "Neural Processors";
  else if (p.includes("custom") || p.includes("analog") || p.includes("hardware")) category = "Custom Synth";

  const prefixes = ["Aether", "Quantum", "Hyper", "Spectral", "Cyber", "Nexus", "Obsidian", "Pulse", "Vortex", "Chroma"];
  const suffixes = ["Matrix", "Wave", "Drone", "Resonator", "Engine", "Synthesizer", "Voice", "Nexus", "Weaver"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return {
    name: `${randomPrefix}-${randomSuffix} ${Math.floor(Math.random() * 900 + 100)}`,
    category,
    arch: `${oscType.toUpperCase()} // ${category}`,
    desc: `AI-synthesized patch generated for: "${prompt}". Engineered with optimized envelope parameters and latent harmonic modulation.`,
    presets: Math.floor(Math.random() * 32) + 16,
    icon: category === "AI Modular" ? "brain" : category === "Neural Processors" ? "wand-magic-sparkles" : "sliders",
    status: "Active",
    created: new Date().toISOString().split("T")[0],
    oscType,
    filterFreq,
    resonance,
    reverbMix,
    attack: p.includes("pad") ? 0.8 : 0.05,
    decay: 0.3,
    sustain: 0.5,
    release: p.includes("pad") ? 2.5 : 0.8,
    distortion: p.includes("distort") || p.includes("acid") ? 0.4 : 0.0,
    bpm: 120,
    arpPattern: p.includes("pad") ? "pentatonic" : "upDown",
    tags: [oscType, category.toLowerCase(), "generative"]
  };
}

// AI Synth Generation Endpoint
app.post("/api/generate-synth", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Prompt string is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful fallback to algorithmic patch generator
    const fallbackPatch = generateAlgorithmicPatch(prompt);
    res.json({ patch: fallbackPatch, mode: "algorithmic-fallback" });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert audio engineer and digital sound designer. 
Generate a JSON configuration for a synthesizer patch based on the following user prompt: "${prompt}".

Return ONLY valid JSON matching this exact structure:
{
  "name": "Creative Synth Name (e.g. Aether-Matrix 9000)",
  "category": "AI Modular" | "Custom Synth" | "Neural Processors",
  "arch": "Short architecture string e.g. FM Wavetable / Granular",
  "desc": "2-sentence vivid description of the sonic characteristics and acoustic texture",
  "presets": 32,
  "icon": "brain" | "microchip" | "wave-square" | "radio" | "sliders" | "wand-magic-sparkles",
  "status": "Online",
  "created": "${new Date().toISOString().split("T")[0]}",
  "oscType": "sine" | "square" | "sawtooth" | "triangle",
  "filterFreq": number between 100 and 8000 (Cutoff in Hz),
  "resonance": number between 0.5 and 15 (Q factor),
  "reverbMix": number between 0 and 1 (Wet ratio),
  "attack": number between 0.01 and 2.0 (seconds),
  "decay": number between 0.1 and 2.0 (seconds),
  "sustain": number between 0.1 and 1.0 (level),
  "release": number between 0.1 and 4.0 (seconds),
  "distortion": number between 0 and 0.8,
  "bpm": number between 80 and 150,
  "arpPattern": "up" | "down" | "upDown" | "random" | "pentatonic",
  "tags": ["tag1", "tag2", "tag3"]
}`,
    });

    const text = response.text || "";
    // Clean JSON formatting if wrapped in code blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const patch = JSON.parse(cleanedText);

    res.json({ patch, mode: "gemini-ai" });
  } catch (error) {
    console.error("Gemini API generation failed, falling back:", error);
    const fallbackPatch = generateAlgorithmicPatch(prompt);
    res.json({ patch: fallbackPatch, mode: "algorithmic-fallback-error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agentic Sound Labs server running on http://localhost:${PORT}`);
  });
}

startServer();
