import React, { useState, useEffect } from "react";
import { Search, FolderOpen, AudioWaveform, Sparkles, Plus, Download, Upload } from "lucide-react";
import { FilterCategory, SynthCategory, SynthPatch } from "./types";
import { initialSynths } from "./data/initialSynths";
import { synthEngine } from "./audio/synthEngine";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { SynthCard } from "./components/SynthCard";
import { StudioModal } from "./components/StudioModal";
import { AiGeneratorModal } from "./components/AiGeneratorModal";
import { AddSynthModal } from "./components/AddSynthModal";
import { Toast } from "./components/Toast";
import { OfflineIndicator } from "./components/OfflineIndicator";

const LOCAL_STORAGE_KEY = "agentic_sound_labs_synths_v1";

export default function App() {
  const [synths, setSynths] = useState<SynthPatch[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading localStorage:", e);
    }
    return initialSynths;
  });

  const [currentFilter, setCurrentFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSynth, setSelectedSynth] = useState<SynthPatch | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState("");
  const [isAddSynthModalOpen, setIsAddSynthModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(synths));
    } catch (e) {
      console.warn("Error saving to localStorage:", e);
    }
  }, [synths]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleQuickPlayTest = async (synth: SynthPatch) => {
    await synthEngine.init();
    synthEngine.loadPatch(synth);
    synthEngine.playNote("C4", "8n");
    setTimeout(() => {
      synthEngine.playNote("E4", "8n");
    }, 150);
    setTimeout(() => {
      synthEngine.playNote("G4", "8n");
    }, 300);
  };

  const handleAddSynth = (newSynth: SynthPatch) => {
    setSynths((prev) => [newSynth, ...prev]);
  };

  const handleUpdateSynth = (updatedSynth: SynthPatch) => {
    setSynths((prev) =>
      prev.map((s) => (s.id === updatedSynth.id ? updatedSynth : s))
    );
    if (selectedSynth && selectedSynth.id === updatedSynth.id) {
      setSelectedSynth(updatedSynth);
    }
  };

  const handleDeleteSynth = (id: string | number) => {
    setSynths((prev) => prev.filter((s) => s.id !== id));
    showToast("Synth patch removed from archive");
  };

  const handleAiQuickGenerate = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setIsAiModalOpen(true);
  };

  const handlePatchGeneratedByAi = (
    newPatch: SynthPatch,
    autoOpenStudio = false
  ) => {
    handleAddSynth(newPatch);
    if (autoOpenStudio) {
      setSelectedSynth(newPatch);
    }
  };

  const exportArchive = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(synths, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Agentic_Sound_Labs_Archive.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Synth archive exported successfully!");
  };

  const importArchive = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setSynths(imported);
          showToast(`Imported ${imported.length} synths successfully!`);
        } else {
          showToast("Invalid JSON archive format");
        }
      } catch (err) {
        showToast("Error reading archive file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Filter & Search Logic
  const filteredSynths = synths.filter((synth) => {
    const matchesCategory =
      currentFilter === "all" || synth.category === currentFilter;
    const matchesSearch =
      synth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      synth.arch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      synth.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      synth.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAiGenerator={() => {
          setAiInitialPrompt("");
          setIsAiModalOpen(true);
        }}
        onOpenAddSynth={() => setIsAddSynthModalOpen(true)}
        onExportArchive={exportArchive}
        onImportArchive={importArchive}
      />

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Hero & Quick Generator Banner */}
        <HeroSection
          synths={synths}
          onQuickGenerate={handleAiQuickGenerate}
        />

        {/* Filter and Search Bar */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {(
              [
                { label: "All Creations", value: "all" },
                { label: "AI Modular", value: "AI Modular" },
                { label: "Custom Synths", value: "Custom Synth" },
                { label: "Neural Processors", value: "Neural Processors" },
                { label: "FM Synths", value: "FM Synth" },
              ] as const
            ).map((filter) => {
              const isActive = currentFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setCurrentFilter(filter.value as FilterCategory)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap border ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search synths, tags, architecture..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </section>

        {/* Synths Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSynths.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-xl">
                <FolderOpen className="w-7 h-7 text-slate-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white">No sound labs found</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  No synths matched your current filters or search query. Generate a new patch with AI!
                </p>
              </div>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Synth Patch</span>
              </button>
            </div>
          ) : (
            filteredSynths.map((synth) => (
              <SynthCard
                key={synth.id}
                synth={synth}
                onOpenStudio={(s) => setSelectedSynth(s)}
                onDelete={handleDeleteSynth}
                onPlayQuickTest={handleQuickPlayTest}
              />
            ))
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <AudioWaveform className="w-4 h-4 text-emerald-400" />
            <span>Agentic Sound Labs — Web Audio & AI Generative DSP Studio</span>
          </div>
          <div className="font-mono text-slate-600">
            Powered by Tone.js & Gemini AI
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <StudioModal
        synth={selectedSynth}
        onClose={() => setSelectedSynth(null)}
        onSavePatch={handleUpdateSynth}
        onShowToast={showToast}
      />

      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onPatchGenerated={handlePatchGeneratedByAi}
        onShowToast={showToast}
        initialPrompt={aiInitialPrompt}
      />

      <AddSynthModal
        isOpen={isAddSynthModalOpen}
        onClose={() => setIsAddSynthModalOpen(false)}
        onAddSynth={handleAddSynth}
        onShowToast={showToast}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      <OfflineIndicator />
    </div>
  );
}
