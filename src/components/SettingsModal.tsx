"use client";

import React, { useState } from "react";
import {
  X,
  Server,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  ExternalLink
} from "lucide-react";
import { AppSettings, CopilotMode } from "@/lib/types";
import { COPILOT_MODES } from "@/lib/sampleData";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  ollamaOnline: boolean;
  setOllamaOnline: (online: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  ollamaOnline,
  setOllamaOnline
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const testOllamaConnection = async () => {
    setTestingConnection(true);
    setConnectionMessage(null);
    try {
      const startTime = performance.now();
      const res = await fetch(`${localSettings.ollamaUrl}/api/tags`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m: any) => m.name).join(", ");
        setOllamaOnline(true);
        setConnectionMessage(`Connected successfully (${latency}ms). Found: ${models || "No models pulled yet"}`);
      } else {
        setOllamaOnline(false);
        setConnectionMessage(`Server reachable but returned HTTP ${res.status}.`);
      }
    } catch {
      setOllamaOnline(false);
      setConnectionMessage("Connection failed. Ensure Ollama is running (`ollama serve`) at localhost:11434.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Runtime &amp; Model Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your local Ollama STT/LLM pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Ollama URL & Test Ping */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Local Ollama Base URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={localSettings.ollamaUrl}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, ollamaUrl: e.target.value })
                }
                placeholder="http://localhost:11434"
                className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
              <button
                onClick={testOllamaConnection}
                disabled={testingConnection}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
                <span>Test Ping</span>
              </button>
            </div>

            {connectionMessage && (
              <p
                className={`mt-2 text-xs flex items-center space-x-1.5 ${
                  ollamaOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {ollamaOnline ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{connectionMessage}</span>
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              LLM Model Selection
            </label>
            <select
              value={localSettings.selectedModel}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, selectedModel: e.target.value })
              }
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            >
              <option value="llama3">Llama 3 (8B) — Recommended Balanced</option>
              <option value="mistral">Mistral (7B) — High Speed &amp; Accuracy</option>
              <option value="phi3">Phi-3 Mini (3.8B) — Ultra-Fast On-Device</option>
              <option value="gemma2">Gemma 2 (9B) — Google Architecture</option>
              <option value="deepseek-r1">DeepSeek R1 — Reasoning Focused</option>
              <option value="parakeet">Parakeet Meeting Assistant (Local Model)</option>
            </select>
          </div>

          {/* Copilot Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Copilot Persona Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COPILOT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      copilotMode: mode.id as CopilotMode
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    localSettings.copilotMode === mode.id
                      ? "bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-bold">{mode.name}</span>
                  <span className="text-[10px] mt-1 opacity-80 line-clamp-2">
                    {mode.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Temperature (Creativity)
              </label>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {localSettings.temperature}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  temperature: parseFloat(e.target.value)
                })
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.1 (Strict &amp; Precise)</span>
              <span>0.7 (Balanced)</span>
              <span>1.2 (Creative)</span>
            </div>
          </div>

          {/* Quick Ollama Terminal Command helper */}
          <div className="p-3 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1 font-sans text-[11px]">
              <Terminal className="w-3.5 h-3.5" />
              <span>How to start local Ollama:</span>
            </div>
            <p className="text-emerald-400 select-all">$ ollama run llama3</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
