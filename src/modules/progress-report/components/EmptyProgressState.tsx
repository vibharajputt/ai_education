// src/modules/progress-report/components/EmptyProgressState.tsx
import React from 'react';
import { Sparkles, Play, Target, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyProgressStateProps {
  onSeedDemo: () => void;
}

export function EmptyProgressState({ onSeedDemo }: EmptyProgressStateProps) {
  return (
    <div className="p-8 sm:p-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-center space-y-6 max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center mx-auto shadow-xs">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
          Welcome to Your Mastery Matrix!
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed max-w-md mx-auto">
          Take your first quiz or practice session to compute your Elo ratings, FSRS spaced-repetition schedules, and SWOT diagnostic reports.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
        <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
          <Zap className="w-4 h-4 text-amber-500 mb-1.5" />
          <h4 className="font-bold text-xs text-[var(--color-text)]">Elo Rating</h4>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Calibrates per-concept mastery from 600 to 2000 pts.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
          <Target className="w-4 h-4 text-emerald-500 mb-1.5" />
          <h4 className="font-bold text-xs text-[var(--color-text)]">FSRS Memory</h4>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Schedules optimal review intervals to prevent forgetting.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
          <Award className="w-4 h-4 text-blue-500 mb-1.5" />
          <h4 className="font-bold text-xs text-[var(--color-text)]">SWOT Matrix</h4>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Diagnoses strengths, gaps, and threats deterministically.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
        <Link
          to="/school/quiz"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm font-bold shadow-md transition-opacity"
        >
          <Play className="w-4 h-4 fill-current" />
          Start 10-Question Diagnostic Quiz
        </Link>

        <button
          type="button"
          onClick={onSeedDemo}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs sm:text-sm font-semibold text-[var(--color-text)] transition-colors"
        >
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          Load Demo Diagnostic Data
        </button>
      </div>
    </div>
  );
}
