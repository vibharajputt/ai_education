import React from 'react';
import { ChapterHeatmapRow } from '../types';
import { ArrowUpRight, ArrowRight, ArrowDownRight, Info } from 'lucide-react';

interface HeatmapViewProps {
  rows: ChapterHeatmapRow[];
  years: number[];
  onCellClick: (chapter: string, year: number) => void;
  selectedChapter?: string;
  selectedYear?: number;
}

function getCellColorClass(marks: number): string {
  if (marks === 0) return 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] opacity-60';
  if (marks <= 5) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
  if (marks <= 10) return 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40 font-semibold';
  if (marks <= 15) return 'bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-500/50 font-bold';
  return 'bg-rose-500/30 text-rose-900 dark:text-rose-100 border border-rose-500/60 font-extrabold shadow-sm';
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({
  rows,
  years,
  onCellClick,
  selectedChapter,
  selectedYear,
}) => {
  return (
    <div className="space-y-4">
      {/* Legend & Instructions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] font-medium">
          <Info className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
          <span>Click any cell to filter the question browser to that Chapter + Year.</span>
        </div>

        {/* Color Intensity Scale Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--color-text-muted)] font-medium mr-1">Marks Scale:</span>
          <span className="px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] border text-[var(--color-text-muted)]">0m</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">1-5m</span>
          <span className="px-2 py-0.5 rounded bg-sky-500/25 text-sky-700 dark:text-sky-300 font-medium">6-10m</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-800 dark:text-amber-200 font-bold">11-15m</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/35 text-rose-900 dark:text-rose-100 font-black">15+m</span>
        </div>
      </div>

      {/* Horizontally Scrollable Table Container for Mobile Safety */}
      <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <table className="w-full text-left border-collapse min-w-[820px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5 sticky left-0 z-10 bg-[var(--color-surface-subtle)] min-w-[220px]">
                Chapter
              </th>
              <th className="py-3 px-2 text-center min-w-[70px]">Subject</th>
              {years.map((y) => (
                <th key={y} className="py-3 px-2 text-center min-w-[52px]">
                  {y}
                </th>
              ))}
              <th className="py-3 px-3 text-center min-w-[80px]">10-Yr Total</th>
              <th className="py-3 px-3 text-center min-w-[90px]">5-Yr Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] font-medium">
            {rows.map((row) => (
              <tr
                key={row.chapter}
                className="hover:bg-[var(--color-surface-subtle)]/50 transition-colors"
              >
                {/* Sticky Left Column: Chapter Name */}
                <td className="py-2.5 px-3.5 sticky left-0 z-10 bg-[var(--color-surface)] font-semibold text-[var(--color-text)] truncate max-w-[220px]">
                  {row.chapter}
                </td>

                <td className="py-2.5 px-2 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                      row.subject === 'Science'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {row.subject}
                  </span>
                </td>

                {/* Heatmap Cells */}
                {years.map((y) => {
                  const marks = row.yearMarks[y] || 0;
                  const isSelected = selectedChapter === row.chapter && selectedYear === y;
                  const colorClass = getCellColorClass(marks);

                  return (
                    <td key={y} className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => onCellClick(row.chapter, y)}
                        title={`${row.chapter} (${y}): ${marks} marks`}
                        className={`w-full py-1.5 px-1 rounded-lg transition-all text-center flex flex-col items-center justify-center cursor-pointer ${colorClass} ${
                          isSelected ? 'ring-2 ring-[var(--color-accent)] ring-offset-1 scale-105' : 'hover:scale-105'
                        }`}
                      >
                        <span className="text-xs font-bold leading-none">{marks}m</span>
                      </button>
                    </td>
                  );
                })}

                {/* Row Total Marks */}
                <td className="py-2.5 px-3 text-center font-bold text-[var(--color-text)] bg-[var(--color-surface-subtle)]/40">
                  {row.totalMarks} m
                </td>

                {/* 5-Year Trend Arrow */}
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                      row.trend === 'up'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : row.trend === 'down'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-gray-500/15 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {row.trend === 'up' && (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> Rising
                      </>
                    )}
                    {row.trend === 'flat' && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" /> Steady
                      </>
                    )}
                    {row.trend === 'down' && (
                      <>
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" /> Drop
                      </>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
