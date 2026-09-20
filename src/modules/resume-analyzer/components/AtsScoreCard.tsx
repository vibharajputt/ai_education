// src/modules/resume-analyzer/components/AtsScoreCard.tsx
// ATS Overall Score ring and 5 per-factor category progress rings.

import React from 'react';
import { ProgressRing } from '@components/ProgressRing';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { AtsFactorScores } from '../utils/resumeParser';

interface AtsScoreCardProps {
  overallScore: number;
  factors: AtsFactorScores;
}

export const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ overallScore, factors }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 65) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge label="Strong ATS Match" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" />;
    if (score >= 65) return <Badge label="Moderate ATS Match" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" />;
    return <Badge label="Needs Optimization" className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" />;
  };

  const factorItems = [
    { label: 'Parseability', value: factors.parseability, desc: 'Clean headers & contact info' },
    { label: 'Keywords', value: factors.keywords, desc: 'Technical & domain terminology' },
    { label: 'Structure', value: factors.structure, desc: 'Section hierarchy & ordering' },
    { label: 'Quantification', value: factors.quantification, desc: 'Metrics, % & scale indicators' },
    { label: 'Length & Formatting', value: factors.length, desc: 'Word count & bullet density' },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center">
            <ProgressRing value={overallScore} size={90} strokeWidth={8} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[var(--color-text)]">ATS Score: {overallScore}/100</h3>
              {getScoreBadge(overallScore)}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] max-w-md">
              Evaluated against modern applicant tracking system parsing algorithms and recruiter scanning patterns.
            </p>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-xs font-semibold text-[var(--color-text-muted)]">Overall Rating</div>
          <div className={`text-2xl font-black ${getScoreColor(overallScore)}`}>
            {overallScore >= 80 ? 'EXCELLENT' : overallScore >= 65 ? 'COMPETITIVE' : 'NEEDS WORK'}
          </div>
        </div>
      </div>

      {/* 5 Per-Factor Breakdown Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          Per-Factor Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {factorItems.map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col items-center text-center space-y-2"
            >
              <ProgressRing value={item.value} size={48} strokeWidth={5} />
              <div>
                <div className="text-xs font-bold text-[var(--color-text)]">{item.label}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
