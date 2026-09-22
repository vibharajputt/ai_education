import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, AlertTriangle, Lightbulb, Code2 } from 'lucide-react';

interface SkillGapViewProps {
  extractedEntities: string[];
  missingKeywords?: string[];
  suggestedProjects?: Array<{
    title: string;
    description: string;
    skillsTargeted: string[];
  }>;
}

export function SkillGapView({
  extractedEntities,
  missingKeywords = [],
  suggestedProjects = [],
}: SkillGapViewProps) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--color-accent)]" />
          Skills Inventory & Job Description Keyword Match
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          Extracted competencies verified against recruiter search algorithms.
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Detected Technical & Domain Skills ({extractedEntities.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {extractedEntities.map((skill, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-500/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {missingKeywords.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            High-Value Keywords Missing vs Target Benchmark
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-amber-800 dark:text-amber-200 text-xs font-semibold border border-amber-500/30"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestedProjects.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Targeted Portfolio Projects to Bridge Detected Skill Gaps
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedProjects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[var(--color-accent)]" />
                    {proj.title}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  {proj.skillsTargeted.map((s, si) => (
                    <span
                      key={si}
                      className="px-2 py-0.5 rounded bg-[var(--color-surface)] text-[11px] font-mono font-medium text-[var(--color-text)] border border-[var(--color-border)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(missingKeywords.length > 0 || extractedEntities.length > 0) && (
        <div className="pt-4 border-t border-[var(--color-border)]">
          <Link
            to="/college/interview-prep"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            Practice interview questions for these skills →
          </Link>
        </div>
      )}
    </div>
  );
}
