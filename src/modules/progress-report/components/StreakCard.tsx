// src/modules/progress-report/components/StreakCard.tsx
import React from 'react';
import type { UserStats } from '@core';
import { Flame, Award, Target, CheckCircle2, RotateCcw } from 'lucide-react';

interface StreakCardProps {
  stats: UserStats;
  onReset: () => void;
}

export function StreakCard({ stats, onReset }: StreakCardProps) {
  const hours = Math.round((stats.totalTimeSeconds / 3600) * 10) / 10;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Streak */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
          <Flame className="w-6 h-6 fill-current" />
        </div>
        <div>
          <span className="text-xs text-[var(--color-text-muted)] font-medium block">
            Current Streak
          </span>
          <div className="text-2xl font-black text-[var(--color-text)]">
            {stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            Record: {stats.longestStreak} days
          </span>
        </div>
      </div>

      {/* Accuracy */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-[var(--color-text-muted)] font-medium block">
            Overall Accuracy
          </span>
          <div className="text-2xl font-black text-[var(--color-text)]">
            {stats.accuracyPercent}%
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {stats.totalCorrect} / {stats.totalAttempts} correct
          </span>
        </div>
      </div>

      {/* Solved Questions */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-[var(--color-text-muted)] font-medium block">
            Problems Solved
          </span>
          <div className="text-2xl font-black text-[var(--color-text)]">
            {stats.totalAttempts}
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            ~{stats.avgTimePerQuestion}s per question
          </span>
        </div>
      </div>

      {/* Study Time */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-[var(--color-text-muted)] font-medium block">
            Total Study Time
          </span>
          <div className="text-2xl font-black text-[var(--color-text)]">
            {hours} hrs
          </div>
          <button
            onClick={onReset}
            className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 mt-0.5"
          >
            <RotateCcw className="w-3 h-3" /> Reset Store
          </button>
        </div>
      </div>
    </div>
  );
}
