// src/modules/weak-topics/components/ActionPlan.tsx
import React from 'react';
import type { ConceptMastery } from '@core';
import { Sparkles, Printer, Zap, Network, ArrowRight, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionPlanProps {
  weaknesses: ConceptMastery[];
  threats: ConceptMastery[];
}

export function ActionPlan({ weaknesses, threats }: ActionPlanProps) {
  const navigate = useNavigate();

  const priorityConcepts = [...weaknesses, ...threats].slice(0, 3).map((c) => c.concept);

  return (
    <div className="p-5 sm:p-7 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="font-bold text-base text-[var(--color-text)]">
              3-Day Targeted Remedial Roadmap
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Step-by-step action plan to eliminate identified bottlenecks and restore retention.
          </p>
        </div>
      </div>

      {/* 3 Days Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Day 1 */}
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
              Day 1: Concept Rebuild
            </span>
            <CheckSquare className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <h4 className="font-bold text-xs text-[var(--color-text)]">
            Active Recall & Theory Review
          </h4>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            Review derivations and formula cheat sheets for {priorityConcepts[0] || 'your lowest mastery concept'}.
          </p>
        </div>

        {/* Day 2 */}
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Day 2: Worked Practice
            </span>
            <CheckSquare className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <h4 className="font-bold text-xs text-[var(--color-text)]">
            Untimed Step-by-Step Solving
          </h4>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            Solve 10 medium-difficulty questions focusing on step marking rubrics and unit conversions.
          </p>
        </div>

        {/* Day 3 */}
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Day 3: Timed Mastery Test
            </span>
            <CheckSquare className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <h4 className="font-bold text-xs text-[var(--color-text)]">
            Elo Calibration Drill
          </h4>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            Take a 10-question timed quiz to boost your concept Elo rating into the 80%+ mastery bracket.
          </p>
        </div>
      </div>

      {/* 1-Click Action Buttons */}
      <div className="pt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate('/school/sheet-generator')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-xs transition-opacity"
        >
          <Printer className="w-4 h-4" />
          Generate Remedial Worksheet for Weak Topics
        </button>

        <button
          type="button"
          onClick={() => navigate('/school/quiz')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs sm:text-sm font-bold text-[var(--color-text)] transition-colors"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          Launch Targeted Remedial Quiz
        </button>

        <button
          type="button"
          onClick={() => navigate('/school/concept-maps')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs sm:text-sm font-bold text-[var(--color-text)] transition-colors"
        >
          <Network className="w-4 h-4 text-blue-500" />
          Explore Concept Maps
        </button>
      </div>
    </div>
  );
}
