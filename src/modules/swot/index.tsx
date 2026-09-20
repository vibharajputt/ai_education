// src/modules/swot/index.tsx
// Tier B SWOT Analysis & Diagnostic Profile Module.
// Computes statistics in TypeScript and selects from pre-generated narratives (0 live AI calls).

import React from 'react';
import { useProgressStore } from '@core/progress';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Compass, ShieldCheck, AlertCircle, Lightbulb, ShieldAlert, ArrowRight, CheckSquare } from 'lucide-react';
import { swotConfig } from './config';
import { Link } from 'react-router-dom';

export const SwotModule: React.FC = () => {
  const { swotAnalysis } = useProgressStore();
  const { narrative } = swotAnalysis;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Scope Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-[var(--color-accent)]" />
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
              {swotConfig.title}
            </h1>
            <Badge label="Tier B • Diagnostic Profile" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" />
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            {swotConfig.description}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          <span>Scope: {swotConfig.scopeLabel}</span>
        </div>
      </div>

      {/* Overview Diagnostic Banner */}
      <Card className="p-6 space-y-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[var(--color-text)]">Diagnostic Summary Narrative</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Matched from pre-generated profile narratives based on real-time practice stats.
            </p>
          </div>
          <Link
            to="/school/quiz"
            className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            Practice Quiz to Update SWOT <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">
          {narrative.summary}
        </p>

        {/* Quick Baseline Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border text-xs">
            <span className="text-[var(--color-text-muted)] block">Attempted</span>
            <span className="font-bold text-[var(--color-text)]">{swotAnalysis.totalAttempted} Questions</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border text-xs">
            <span className="text-[var(--color-text-muted)] block">Overall Accuracy</span>
            <span className="font-bold text-emerald-500">{swotAnalysis.overallAccuracyPct}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border text-xs">
            <span className="text-[var(--color-text-muted)] block">Strongest Subject</span>
            <span className="font-bold text-[var(--color-text)] truncate block">{swotAnalysis.topSubject}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border text-xs">
            <span className="text-[var(--color-text-muted)] block">Active Streak</span>
            <span className="font-bold text-amber-500">{swotAnalysis.currentStreakDays} Days</span>
          </div>
        </div>
      </Card>

      {/* SWOT 4-Quadrant Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STRENGTHS (S) */}
        <Card className="p-6 space-y-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>STRENGTHS (S)</span>
          </div>
          <div className="space-y-2">
            {narrative.strengths.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* WEAKNESSES (W) */}
        <Card className="p-6 space-y-4 bg-rose-500/5 border-rose-500/20">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span>WEAKNESSES (W)</span>
          </div>
          <div className="space-y-2">
            {narrative.weaknesses.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* OPPORTUNITIES (O) */}
        <Card className="p-6 space-y-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>OPPORTUNITIES (O)</span>
          </div>
          <div className="space-y-2">
            {narrative.opportunities.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* THREATS (T) */}
        <Card className="p-6 space-y-4 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300">
            <ShieldAlert className="w-5 h-5 text-purple-500" />
            <span>THREATS (T)</span>
          </div>
          <div className="space-y-2">
            {narrative.threats.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recommended Next Actions Checklist */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <CheckSquare className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-bold text-[var(--color-text)]">Recommended High-Leverage Action Plan</h3>
        </div>

        <div className="space-y-2.5">
          {narrative.nextActions.map((action, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[11px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{action}</span>
              </div>

              <Link
                to="/school/quiz"
                className="text-[11px] font-bold text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                Execute <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
