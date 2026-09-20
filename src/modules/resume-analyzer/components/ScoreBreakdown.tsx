import React from 'react';
import type { ResumeFactorScore } from '../types';
import { ProgressRing } from '@components/ProgressRing';
import { Award, ShieldCheck } from 'lucide-react';

interface ScoreBreakdownProps {
  atsScore: number;
  factors: ResumeFactorScore[];
}

export function ScoreBreakdown({ atsScore, factors }: ScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'High ATS Match', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    if (score >= 60) return { label: 'Moderate Optimization Needed', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    return { label: 'High Parsing Risk', bg: 'bg-red-500/10 text-red-600 border-red-500/20' };
  };

  const badge = getScoreBadge(atsScore);

  return (
    <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <ProgressRing
              value={atsScore}
              size={110}
              strokeWidth={10}
              className="text-[var(--color-accent)]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black tracking-tight ${getScoreColor(atsScore)}`}>
                {atsScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="text-base font-bold text-[var(--color-text)]">
                Forensic ATS Readiness Score
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] max-w-sm leading-relaxed">
              Derived from automated parseability, keyword density, quantified business metrics, and recruiter scan benchmarks.
            </p>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[var(--color-accent)]" />
          ATS Dimension Breakdown (5 Core Pillars)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--color-text)] truncate">{factor.name}</span>
                  <span className={getScoreColor(factor.score)}>{factor.score}%</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1 line-clamp-2">
                  {factor.description}
                </p>
              </div>

              <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor.score >= 80
                      ? 'bg-emerald-500'
                      : factor.score >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
