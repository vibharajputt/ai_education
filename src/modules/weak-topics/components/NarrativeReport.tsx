// src/modules/weak-topics/components/NarrativeReport.tsx
import React from 'react';
import type { SwotNarrativeProfile } from '../types';
import { Badge } from '@components/Badge';
import { Compass, BookOpen, Clock, Target, CheckCircle2 } from 'lucide-react';

interface NarrativeReportProps {
  profile: SwotNarrativeProfile;
}

export function NarrativeReport({ profile }: NarrativeReportProps) {
  return (
    <div className="p-5 sm:p-7 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="font-bold text-base sm:text-lg text-[var(--color-text)]">
              {profile.title}
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{profile.summary}</p>
        </div>

        <Badge variant="accent">{profile.badge}</Badge>
      </div>

      {/* Specific Diagnostic Observations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Observed Strengths
          </span>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            {profile.strengthsNarrative}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
          <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            Critical Roadblocks
          </span>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            {profile.weaknessesNarrative}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
          <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            High-Leverage Opportunities
          </span>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            {profile.opportunitiesNarrative}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
          <span className="font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            Decay & Exam Pacing Threats
          </span>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            {profile.threatsNarrative}
          </p>
        </div>
      </div>

      {/* Strategic Roadmap Recommendations */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs sm:text-sm text-[var(--color-accent)] flex items-center gap-2">
            <Target className="w-4 h-4" /> Recommended Weekly Study Strategy
          </h4>
          <span className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {profile.recommendedDailyMinutes} Mins / Day
          </span>
        </div>

        <ul className="space-y-2 text-xs text-[var(--color-text)]">
          {profile.studyStrategy.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
