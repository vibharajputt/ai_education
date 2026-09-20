// src/modules/weak-topics/components/SwotMatrix.tsx
import React from 'react';
import type { SwotStats } from '@core';
import { ShieldCheck, AlertOctagon, Lightbulb, AlertTriangle } from 'lucide-react';

interface SwotMatrixProps {
  stats: SwotStats;
  onSelectConcept?: (concept: string) => void;
}

export function SwotMatrix({ stats, onSelectConcept }: SwotMatrixProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. STRENGTHS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider">
              Strengths (S)
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono">
            {stats.strengths.length} Concepts
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Topics with solid retention, high Elo ratings (&ge;75% mastery), and reliable accuracy.
        </p>

        <div className="space-y-2 pt-1 max-h-52 overflow-y-auto pr-1">
          {stats.strengths.map((c) => (
            <div
              key={c.concept}
              onClick={() => onSelectConcept?.(c.concept)}
              className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-emerald-500/30 flex items-center justify-between text-xs cursor-pointer hover:border-emerald-500 transition-colors shadow-2xs"
            >
              <span className="font-bold text-[var(--color-text)] truncate max-w-[70%]">
                {c.concept}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>{c.rating} Elo</span>
                <span>•</span>
                <span>{c.masteryPercent}%</span>
              </div>
            </div>
          ))}
          {stats.strengths.length === 0 && (
            <div className="py-6 text-center text-xs text-[var(--color-text-muted)] italic">
              Solve more questions correctly to establish your confirmed strengths.
            </div>
          )}
        </div>
      </div>

      {/* 2. WEAKNESSES */}
      <div className="p-5 sm:p-6 rounded-2xl bg-rose-500/5 border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider">
              Weaknesses (W)
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-mono">
            {stats.weaknesses.length} Critical Gaps
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Concepts with low accuracy (&lt;50%) or recurrent mistakes needing active step breakdown.
        </p>

        <div className="space-y-2 pt-1 max-h-52 overflow-y-auto pr-1">
          {stats.weaknesses.map((c) => (
            <div
              key={c.concept}
              onClick={() => onSelectConcept?.(c.concept)}
              className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-rose-500/30 flex items-center justify-between text-xs cursor-pointer hover:border-rose-500 transition-colors shadow-2xs"
            >
              <span className="font-bold text-[var(--color-text)] truncate max-w-[70%]">
                {c.concept}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-rose-600 dark:text-rose-400 font-semibold">
                <span>{c.rating} Elo</span>
                <span>•</span>
                <span>{c.masteryPercent}%</span>
              </div>
            </div>
          ))}
          {stats.weaknesses.length === 0 && (
            <div className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Zero critical weak spots detected in active attempts.
            </div>
          )}
        </div>
      </div>

      {/* 3. OPPORTUNITIES */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider">
              Opportunities (O)
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono">
            {stats.opportunities.length} High-Yield
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Topics near the breakthrough threshold (50–74% mastery) that offer highest score gains.
        </p>

        <div className="space-y-2 pt-1 max-h-52 overflow-y-auto pr-1">
          {stats.opportunities.map((c) => (
            <div
              key={c.concept}
              onClick={() => onSelectConcept?.(c.concept)}
              className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-amber-500/30 flex items-center justify-between text-xs cursor-pointer hover:border-amber-500 transition-colors shadow-2xs"
            >
              <span className="font-bold text-[var(--color-text)] truncate max-w-[70%]">
                {c.concept}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-amber-600 dark:text-amber-400 font-semibold">
                <span>{c.rating} Elo</span>
                <span>•</span>
                <span>{c.masteryPercent}%</span>
              </div>
            </div>
          ))}
          {stats.opportunities.length === 0 && (
            <div className="py-6 text-center text-xs text-[var(--color-text-muted)] italic">
              Expand quiz attempts to populate emerging opportunity areas.
            </div>
          )}
        </div>
      </div>

      {/* 4. THREATS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-purple-500/5 border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider">
              Threats (T)
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono">
            {stats.threats.length} Overdue
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Concepts vulnerable to forgetting due to lapsed FSRS spaced-repetition schedules.
        </p>

        <div className="space-y-2 pt-1 max-h-52 overflow-y-auto pr-1">
          {stats.threats.map((c) => (
            <div
              key={c.concept}
              onClick={() => onSelectConcept?.(c.concept)}
              className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-purple-500/30 flex items-center justify-between text-xs cursor-pointer hover:border-purple-500 transition-colors shadow-2xs"
            >
              <span className="font-bold text-[var(--color-text)] truncate max-w-[70%]">
                {c.concept}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-purple-600 dark:text-purple-400 font-semibold">
                <span>{c.rating} Elo</span>
                <span>•</span>
                <span>Lapsed</span>
              </div>
            </div>
          ))}
          {stats.threats.length === 0 && (
            <div className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Memory retention is current with zero lapsed items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
