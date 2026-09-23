// src/modules/sheet-generator/components/CoverageReport.tsx
import React from 'react';
import type { CoverageReportData } from '../types';
import { Badge } from '@components/Badge';
import { Layers, CheckCircle2, Award, Clock, BarChart2 } from 'lucide-react';

interface CoverageReportProps {
  coverage: CoverageReportData;
  timeLimitMinutes: number;
}

export function CoverageReport({ coverage, timeLimitMinutes }: CoverageReportProps) {
  const coveredCount = coverage.coveredChapters.length;
  const totalCount = coverage.allChapters.length;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--color-accent)]" />
          <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text)]">
            Curriculum Coverage Report
          </h3>
        </div>
        <Badge
          variant={coverage.coveragePercent >= 75 ? 'success' : coverage.coveragePercent >= 40 ? 'warning' : 'neutral'}
        >
          Covers {coveredCount} of {totalCount} Chapters ({coverage.coveragePercent}%)
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] font-medium">
          <span>Syllabus Scope</span>
          <span>{coveredCount}/{totalCount} Chapters Active</span>
        </div>
        <div className="h-2 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, coverage.coveragePercent)}%` }}
          />
        </div>
      </div>

      {/* Stat Tiles (2-Column Grid for Sidebar) */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Questions</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-[var(--color-text)]">
              {coverage.selectedCount}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">items</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-medium truncate">
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Total Marks</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-[var(--color-text)]">
              {coverage.totalMarks}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">Marks</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-medium truncate">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">Suggested Time</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-[var(--color-text)]">
              {timeLimitMinutes}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">Mins</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-medium truncate">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">Difficulty Mix</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
              {coverage.difficultyCounts.easy || 0}E
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
              {coverage.difficultyCounts.medium || 0}M
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
              {coverage.difficultyCounts.hard || 0}H
            </span>
          </div>
        </div>
      </div>

      {/* Chapters Chip List */}
      <div className="space-y-1.5 pt-1">
        <span className="text-xs text-[var(--color-text-muted)] font-medium">Included Chapters:</span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {coverage.coveredChapters.map((ch) => (
            <span
              key={ch}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium"
            >
              ✓ {ch}
            </span>
          ))}
          {coverage.coveredChapters.length === 0 && (
            <span className="text-xs text-[var(--color-text-muted)] italic">No chapters selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
