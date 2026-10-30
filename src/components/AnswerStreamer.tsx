"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCw,
  Volume2,
  StopCircle,
  Zap,
  Clock,
  Gauge,
  CornerDownLeft
} from "lucide-react";
import { AppSettings } from "@/lib/types";

interface AnswerStreamerProps {
  answer: string;
  isGenerating: boolean;
  onSuggestAnswer: () => void;
  canSuggest: boolean;
  metrics: {
    tokenCount: number;
    duration: number;
    tokensPerSecond: number;
    source: string;
  };
  settings: AppSettings;
}

export default function AnswerStreamer({
  answer,
  isGenerating,
  onSuggestAnswer,
  canSuggest,
  metrics,
  settings
}: AnswerStreamerProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = answer.replace(/[#*`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Render progressive text with basic Markdown formatting
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith("### ")) {
        return (
          <h3
            key={idx}
            className="text-base font-bold text-slate-900 dark:text-cyan-300 mt-4 mb-2 flex items-center space-x-2"
          >
            <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block" />
            <span>{line.replace("### ", "")}</span>
          </h3>
        );
      }
      // Bullet point
      if (line.trim().startsWith("• ") || line.trim().startsWith("- ")) {
        const content = line.trim().replace(/^[•\-]\s*/, "");
        return (
          <li key={idx} className="ml-5 list-disc my-1 text-slate-700 dark:text-slate-200">
            {formatInlineStyles(content)}
          </li>
        );
      }
      // Numbered item
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="font-semibold text-slate-900 dark:text-slate-100 mt-3 mb-1">
            {formatInlineStyles(line)}
          </div>
        );
      }
      // Empty line
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      // Normal paragraph
      return (
        <p key={idx} className="my-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
          {formatInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper for bold and code tags
  const formatInlineStyles = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-mono text-xs"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-200">
      {/* Top Header & Suggest Answer Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400 flex items-center space-x-1.5">
              <Bot className="w-4 h-4" />
              <span>AI Answer Copilot</span>
            </h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Progressive Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click &quot;Suggest Answer&quot; to synthesize an on-device response via local Ollama.
          </p>
        </div>

        {/* Suggest Answer Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSuggestAnswer}
            disabled={!canSuggest || isGenerating}
            data-testid="suggest-btn"
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition active:scale-95 cursor-pointer ${
              isGenerating
                ? "bg-purple-700/80 cursor-wait animate-pulse"
                : canSuggest
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 shadow-purple-600/30"
                : "bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed"
            }`}
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Generating Stream...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Suggest Answer</span>
                <span className="hidden sm:inline-flex items-center ml-1 px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-mono">
                  ⌘↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progressive Answer Display Area */}
      <div className="mt-4">
        <div
          data-testid="answer-box"
          className="min-h-[220px] max-h-[460px] overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 font-sans text-sm transition"
        >
          {answer ? (
            <div className="space-y-1">
              {renderFormattedMarkdown(answer)}
              {isGenerating && (
                <span className="inline-block w-2 h-4 ml-1 bg-purple-500 cursor-blink align-middle" />
              )}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600">
              <Bot className="w-10 h-10 mb-2 opacity-40 text-purple-400" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No answer generated yet.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 max-w-sm">
                Capture question audio from your microphone above or choose a sample prompt, then click &quot;Suggest Answer&quot;.
              </p>
            </div>
          )}
        </div>

        {/* Live Metrics & Actions Footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Generation Telemetry Metrics */}
          <div className="flex items-center space-x-4">
            {metrics.tokenCount > 0 && (
              <>
                <div className="flex items-center space-x-1" title="Tokens Generated">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {metrics.tokenCount}
                  </span>
                  <span>tokens</span>
                </div>

                <div className="flex items-center space-x-1" title="Generation Latency">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {metrics.duration.toFixed(2)}s
                  </span>
                </div>

                <div className="flex items-center space-x-1" title="Tokens Per Second Speed">
                  <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {metrics.tokensPerSecond.toFixed(1)}
                  </span>
                  <span>tok/s</span>
                </div>

                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {metrics.source === "ollama" ? "Ollama Local :11434" : "Local Engine"}
                </span>
              </>
            )}
          </div>

          {/* Answer Controls: Copy, Read Aloud, Regenerate */}
          {answer && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition font-medium"
                title="Copy markdown answer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Answer"}</span>
              </button>

              <button
                onClick={handleSpeak}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition font-medium"
                title={isSpeaking ? "Stop Speech" : "Read Answer Aloud"}
              >
                {isSpeaking ? (
                  <StopCircle className="w-3.5 h-3.5 text-red-500 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                )}
                <span>{isSpeaking ? "Stop" : "Listen"}</span>
              </button>

              <button
                onClick={onSuggestAnswer}
                disabled={isGenerating}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition font-medium"
                title="Regenerate Answer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
