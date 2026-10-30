"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import Header from "@/components/Header";
import TranscriptionBox from "@/components/TranscriptionBox";
import AnswerStreamer from "@/components/AnswerStreamer";
import PresetBar from "@/components/PresetBar";
import SettingsModal from "@/components/SettingsModal";
import HistoryDrawer from "@/components/HistoryDrawer";
import { AppSettings, HistoryItem } from "@/lib/types";

export default function Home() {
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // Transcription state
  const [transcription, setTranscription] = useState("");

  // Answer streaming state
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState({
    tokenCount: 0,
    duration: 0,
    tokensPerSecond: 0,
    source: "local-runtime"
  });

  // Settings & History state
  const [settings, setSettings] = useState<AppSettings>({
    ollamaUrl: "http://localhost:11434",
    selectedModel: "llama3",
    copilotMode: "interview",
    temperature: 0.7,
    useLocalSimulationFallback: true,
    autoSuggestOnSpeechEnd: false
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ollamaOnline, setOllamaOnline] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Generation abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof document !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Check Ollama ping on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch(`${settings.ollamaUrl}/api/tags`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
          setOllamaOnline(true);
        } else {
          setOllamaOnline(false);
        }
      } catch {
        setOllamaOnline(false);
      }
    };
    checkOllama();
  }, [settings.ollamaUrl]);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("parakeet_history");
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch {}
      }

      const savedSettings = localStorage.getItem("parakeet_settings");
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch {}
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback((q: string, a: string, tokens: number, dur: number, model: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      question: q,
      answer: a,
      model,
      tokens,
      duration: dur
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 49)];
      if (typeof window !== "undefined") {
        localStorage.setItem("parakeet_history", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Suggest Answer progressive streaming handler
  const handleSuggestAnswer = async () => {
    const query = transcription.trim();
    if (!query || isGenerating) return;

    setIsGenerating(true);
    setAnswer("");
    setMetrics({ tokenCount: 0, duration: 0, tokensPerSecond: 0, source: "local-runtime" });

    const startTime = performance.now();
    let currentTokens = 0;
    let accumulatedText = "";
    let detectedSource = "local-runtime";

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          model: settings.selectedModel,
          ollamaUrl: settings.ollamaUrl,
          copilotMode: settings.copilotMode,
          temperature: settings.temperature
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.source) {
                detectedSource = data.source;
              }
              if (data.token) {
                accumulatedText += data.token;
                currentTokens += 1;
                setAnswer(accumulatedText);

                const currentDuration = Math.max(0.01, (performance.now() - startTime) / 1000);
                setMetrics({
                  tokenCount: currentTokens,
                  duration: currentDuration,
                  tokensPerSecond: currentTokens / currentDuration,
                  source: detectedSource
                });
              }
              if (data.done) {
                break;
              }
            } catch {
              // Ignore non-json lines
            }
          }
        }
      }

      const finalDuration = Math.max(0.1, (performance.now() - startTime) / 1000);
      setMetrics({
        tokenCount: currentTokens,
        duration: finalDuration,
        tokensPerSecond: currentTokens / finalDuration,
        source: detectedSource
      });

      // Save to meeting history
      saveToHistory(query, accumulatedText, currentTokens, finalDuration, settings.selectedModel);

      // Trigger subtle celebration confetti on first answer
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#38bdf8", "#818cf8", "#34d399"]
        });
      } catch {}
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Answer generation failed:", err);
        setAnswer(
          "⚠️ Unable to stream response from inference engine. Please check your Ollama connection or verify local server status."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard shortcut listener: Cmd/Ctrl + Enter triggers Suggest Answer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (transcription.trim() && !isGenerating) {
          handleSuggestAnswer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [transcription, isGenerating]);

  // Load a preset question
  const handleSelectPreset = (text: string) => {
    setTranscription(text);
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("parakeet_settings", JSON.stringify(newSettings));
    }
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("parakeet_history");
    }
  };

  // Select item from history
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setTranscription(item.question);
    setAnswer(item.answer);
    setMetrics({
      tokenCount: item.tokens,
      duration: item.duration,
      tokensPerSecond: item.tokens / Math.max(0.1, item.duration),
      source: "session-history"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        isRecording={isRecording}
        recordingTime={recordingTime}
        ollamaOnline={ollamaOnline}
        ollamaModel={settings.selectedModel}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        settings={settings}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Instant Presets Bar */}
        <PresetBar onSelectQuestion={handleSelectPreset} />

        {/* Dual Workspace Grid: Transcription (Mic) & Answer Streamer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Microphone Capture & Speech-to-Text */}
          <TranscriptionBox
            transcription={transcription}
            setTranscription={setTranscription}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            recordingTime={recordingTime}
            setRecordingTime={setRecordingTime}
            audioStream={audioStream}
            setAudioStream={setAudioStream}
          />

          {/* Right Column: Progressive Streaming AI Answer */}
          <AnswerStreamer
            answer={answer}
            isGenerating={isGenerating}
            onSuggestAnswer={handleSuggestAnswer}
            canSuggest={Boolean(transcription.trim())}
            metrics={metrics}
            settings={settings}
          />
        </div>

        {/* Technical Architecture & Local Setup Accordion / Banner */}
        <section className="bg-white/80 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Local-First Speech &amp; LLM Architecture</span>
              </h3>
              <p className="mt-1">
                Built to operate 100% locally on Windows and macOS. Zero audio egress or external cloud dependencies required.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                Ollama :11434
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                Whisper / Parakeet STT
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                SSE Streaming
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-500">
        Parakeet AI Desktop Prototype • Built by Yash Jain for Lacritz.ai Full Stack Assignment • 2026
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        ollamaOnline={ollamaOnline}
        setOllamaOnline={setOllamaOnline}
      />

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
