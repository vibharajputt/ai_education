// src/modules/resume-analyzer/components/LineFindingsList.tsx
// Section-by-section findings quoting exact lines from the resume.

import React from 'react';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { AlertCircle, AlertTriangle, Info, Quote } from 'lucide-react';
import { ResumeFinding } from '../utils/resumeParser';

interface LineFindingsListProps {
  findings: ResumeFinding[];
}

export const LineFindingsList: React.FC<LineFindingsListProps> = ({ findings }) => {
  const getSeverityBadge = (severity: ResumeFinding['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge label="Critical Defect" className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" />;
      case 'high':
        return <Badge label="High Priority" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" />;
      case 'medium':
        return <Badge label="Optimization" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" />;
      case 'low':
      default:
        return <Badge label="Minor" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" />;
    }
  };

  const getSeverityIcon = (severity: ResumeFinding['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">Line-by-Line Section Findings</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Exact quotes extracted directly from your uploaded resume.
          </p>
        </div>
        <span className="text-xs font-semibold text-[var(--color-accent)]">
          {findings.length} Finding{findings.length === 1 ? '' : 's'} Identified
        </span>
      </div>

      <div className="space-y-3">
        {findings.map((finding, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2.5 transition-all hover:border-[var(--color-accent)]/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {getSeverityIcon(finding.severity)}
                <span className="text-xs font-bold text-[var(--color-text)]">Finding #{idx + 1}</span>
              </div>
              {getSeverityBadge(finding.severity)}
            </div>

            {/* Quoted Location from Resume */}
            <div className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
                  Quoted Resume Excerpt:
                </span>
                <span className="italic font-mono text-[11px] text-[var(--color-text)]">"{finding.location}"</span>
              </div>
            </div>

            {/* Issue Explanation */}
            <div className="text-xs text-[var(--color-text)] space-y-1">
              <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <span>Issue:</span>
                <span className="font-normal text-[var(--color-text)]">{finding.issue}</span>
              </div>
            </div>

            {/* Actionable Suggestion */}
            <div className="text-xs p-2.5 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-text)] border border-[var(--color-accent)]/20 font-medium">
              <span className="font-bold text-[var(--color-accent)]">Actionable Fix: </span>
              {finding.suggestion}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
