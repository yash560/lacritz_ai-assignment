"use client";

import React from "react";
import {
  Mic,
  Cpu,
  Settings,
  History,
  Moon,
  Sun,
  Radio,
  Sparkles
} from "lucide-react";
import { AppSettings } from "@/lib/types";

interface HeaderProps {
  isRecording: boolean;
  recordingTime: number;
  ollamaOnline: boolean;
  ollamaModel: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  settings: AppSettings;
}

export default function Header({
  isRecording,
  recordingTime,
  ollamaOnline,
  ollamaModel,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenHistory,
  historyCount,
  settings
}: HeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-xl">
              🦜
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Parakeet AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Desktop Copilot
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              On-Device Speech Transcription & Progressive Streaming LLM
            </p>
          </div>
        </div>

        {/* Center: Live Status Indicators */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
          {/* Mic Status */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {isRecording ? `Recording (${formatTime(recordingTime)})` : "Mic Ready"}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-600">|</span>

          {/* Model Status */}
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {ollamaOnline ? `Ollama (${ollamaModel})` : `Local Engine (${settings.selectedModel})`}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${ollamaOnline ? "bg-emerald-500" : "bg-amber-400"}`}
              title={ollamaOnline ? "Ollama active at localhost:11434" : "Local fallback engine active"}
            />
          </div>

          <span className="text-slate-300 dark:text-slate-600">|</span>

          {/* Mode */}
          <div className="flex items-center space-x-1 capitalize text-slate-600 dark:text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{settings.copilotMode}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            data-testid="history-btn"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            title="Meeting History"
          >
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            data-testid="settings-btn"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Configure Ollama & Models"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            data-testid="theme-toggle"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Light/Dark Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
