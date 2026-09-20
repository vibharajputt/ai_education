import React, { useState } from 'react';
import type { ResumeFinding } from '../types';
import { AlertCircle, Quote, AlertTriangle, Info } from 'lucide-react';

interface FindingsListProps {
  findings: ResumeFinding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = findings.filter(
    (f) => severityFilter === 'all' || f.severity === severityFilter
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          label: 'CRITICAL',
          icon: AlertCircle,
          className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        };
      case 'medium':
        return {
          label: 'MODERATE',
          icon: AlertTriangle,
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      default:
        return {
          label: 'MINOR / POLISH',
          icon: Info,
          className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <Quote className="w-4 h-4 text-[var(--color-accent)]" />
            Forensic Findings & Exact Line Citations ({findings.length})
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Every finding quotes the exact line or section from the uploaded resume.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-subtle)] text-xs">
          {(['all', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3.5">
        {filtered.map((item, idx) => {
          const badge = getSeverityBadge(item.severity);
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3 hover:border-[var(--color-accent)]/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.className}`}>
                  <Icon className="w-3 h-3" />
                  {badge.label}
                </span>
                <span className="text-[11px] font-mono text-[var(--color-text-muted)] truncate max-w-xs">
                  {item.location}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-mono border-l-4 border-l-red-500/80">
                <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                  Quoted Resume Text:
                </div>
                "{item.location.includes(':') ? item.location.split(':')[1].trim() : item.location}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-red-600 dark:text-red-400">
                    Diagnostic Issue:
                  </div>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {item.issue}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    Actionable Improvement:
                  </div>
                  <p className="text-[var(--color-text)] leading-relaxed">
                    {item.suggestion}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
