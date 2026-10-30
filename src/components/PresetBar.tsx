"use client";

import React from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { SAMPLE_QUESTIONS } from "@/lib/sampleData";

interface PresetBarProps {
  onSelectQuestion: (text: string) => void;
}

export default function PresetBar({ onSelectQuestion }: PresetBarProps) {
  return (
    <div className="bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center space-x-2 mb-2.5">
        <Sparkles className="w-4 h-4 text-cyan-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Instant Preset Questions (Test Without Mic)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SAMPLE_QUESTIONS.map((item, index) => (
          <button
            key={index}
            data-testid={`preset-btn-${index}`}
            onClick={() => onSelectQuestion(item.text)}
            className="group flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-slate-800 text-xs text-left transition shadow-sm cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {item.title}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              ({item.category})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
