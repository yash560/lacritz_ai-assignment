"use client";

import React from "react";
import {
  X,
  History,
  Download,
  Trash2,
  Clock,
  Zap,
  ArrowRight,
  FileText
} from "lucide-react";
import { HistoryItem } from "@/lib/types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  const exportMarkdown = () => {
    if (history.length === 0) return;
    let md = `# Parakeet AI — Meeting Session Transcript\n\n`;
    md += `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;

    history.forEach((item, idx) => {
      md += `### ${idx + 1}. Transcribed Question (${item.timestamp})\n`;
      md += `**Question:**\n> ${item.question}\n\n`;
      md += `**AI Suggested Answer (${item.model}):**\n${item.answer}\n\n`;
      md += `*Metrics: ${item.tokens} tokens in ${item.duration.toFixed(2)}s*\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `parakeet-meeting-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Meeting Session Log
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {history.length > 0 && (
              <>
                <button
                  onClick={exportMarkdown}
                  className="p-2 rounded-lg text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Export to Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClearHistory}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Clear history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600">
              <FileText className="w-10 h-10 mb-2 opacity-40 text-cyan-500" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No meeting records yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 max-w-xs">
                As you capture microphone questions and suggest answers, they will be archived here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                    {item.model}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-1.5">
                  {item.question}
                </p>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {item.answer.replace(/[#*`_]/g, "")}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>{item.tokens} tokens • {item.duration.toFixed(1)}s</span>
                  </span>
                  <span className="text-cyan-500 font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
