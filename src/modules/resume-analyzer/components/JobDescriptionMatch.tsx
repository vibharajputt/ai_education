// src/modules/resume-analyzer/components/JobDescriptionMatch.tsx
// Displays missing skill gaps vs JD and suggested portfolio projects.

import React from 'react';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Target, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { ResumeAnalysisResult } from '../utils/resumeParser';

interface JobDescriptionMatchProps {
  jdMatch: NonNullable<ResumeAnalysisResult['jdMatch']>;
}

export const JobDescriptionMatch: React.FC<JobDescriptionMatchProps> = ({ jdMatch }) => {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[var(--color-accent)]" />
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Job Description Match & Skill Gap Analysis</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Comparison against specified target position requirements.
            </p>
          </div>
        </div>
        <Badge label="Match Mode Active" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identified Missing Skill Gaps */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span>Missing Skill Gaps vs. Target JD</span>
          </div>

          <div className="space-y-2">
            {jdMatch.missingSkills.map((gap, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--color-text)]">{gap.skill}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] font-medium">
                    {gap.category}
                  </span>
                </div>
                <a
                  href={`/#/college/interview-prep?skill=${encodeURIComponent(gap.skill)}`}
                  className="text-[10px] px-2.5 py-1 rounded bg-blue-500/15 text-blue-400 font-bold hover:bg-blue-500/25 transition-colors shrink-0"
                >
                  Practice Qs &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Matching Skills Confirmed */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4" />
            <span>Matching Resume Qualifications</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {jdMatch.matchingSkills.length > 0 ? (
              jdMatch.matchingSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-emerald-500/30 text-xs font-semibold text-[var(--color-text)] flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--color-text-muted)]">Core skills analyzed and indexed.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Projects to Close Skill Gaps */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Suggested Projects to Close Identified Skill Gaps</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jdMatch.suggestedProjects.map((project, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2 hover:border-[var(--color-accent)]/30 transition-colors"
            >
              <h4 className="text-xs font-bold text-[var(--color-accent)]">{project.title}</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{project.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.skillsGained.map((sg, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold border border-[var(--color-accent)]/20"
                  >
                    +{sg}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
