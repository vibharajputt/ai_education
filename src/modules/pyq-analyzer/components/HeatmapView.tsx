import React, { useState, useMemo } from 'react';
import type { ContentItem } from '@core/types';
import { ChapterHeatmapRow, getItemYear } from '../types';
import { Card } from '@components/Card';
import { ContentItemCard } from '@components/ContentItemCard';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  X,
  ChevronRight,
} from 'lucide-react';

interface HeatmapViewProps {
  items: ContentItem[];
  matrix: ChapterHeatmapRow[];
  years: number[];
  onSelectQuestion: (item: ContentItem) => void;
}

export function HeatmapView({
  items,
  matrix,
  years,
  onSelectQuestion,
}: HeatmapViewProps) {
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Science' | 'Mathematics'>('all');
  const [selectedCell, setSelectedCell] = useState<{ chapter: string; year?: number } | null>(null);

  const filteredRows = useMemo(() => {
    if (subjectFilter === 'all') return matrix;
    return matrix.filter((r) => r.subject === subjectFilter);
  }, [matrix, subjectFilter]);

  const selectedQuestions = useMemo(() => {
    if (!selectedCell) return [];
    return items.filter((item) => {
      if (item.chapter !== selectedCell.chapter) return false;
      const yr = getItemYear(item);
      if (selectedCell.year && yr !== selectedCell.year) return false;
      return true;
    });
  }, [items, selectedCell]);

  const grandTotalMarks = useMemo(() => {
    return filteredRows.reduce((acc, r) => acc + r.totalMarks, 0);
  }, [filteredRows]);

  const getCellClass = (marks: number, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)] ring-offset-2 font-bold shadow-md scale-105 z-10';
    }
    if (!marks || marks === 0) {
      return 'bg-[var(--color-surface-subtle)]/60 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]';
    }
    if (marks <= 3) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium';
    }
    if (marks <= 6) {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-200 dark:hover:bg-blue-900/80 font-semibold';
    }
    return 'bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-500 font-bold shadow-sm';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubjectFilter('all')}
            className={
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ' +
              (subjectFilter === 'all'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
            }
          >
            All Subjects (27 Chapters)
          </button>
          <button
            type="button"
            onClick={() => setSubjectFilter('Science')}
            className={
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ' +
              (subjectFilter === 'Science'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
            }
          >
            Science (13)
          </button>
          <button
            type="button"
            onClick={() => setSubjectFilter('Mathematics')}
            className={
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ' +
              (subjectFilter === 'Mathematics'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
            }
          >
            Mathematics (14)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)] font-medium">
          <span className="text-[11px] uppercase tracking-wider font-bold">Marks Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] inline-block" />
            <span>0m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 inline-block" />
            <span>1–3m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 inline-block" />
            <span>4–6m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-indigo-600 text-white inline-block" />
            <span>7m+</span>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
                <th className="py-3 px-4 font-bold text-[var(--color-text)] sticky left-0 bg-[var(--color-surface-subtle)] z-20 min-w-[200px] sm:min-w-[240px]">
                  Chapter Name
                </th>
                <th className="py-3 px-2 font-bold text-[var(--color-text-muted)] text-center min-w-[80px]">
                  Subject
                </th>
                {years.map((year) => (
                  <th
                    key={year}
                    className="py-3 px-2 font-bold text-[var(--color-text)] text-center min-w-[46px]"
                  >
                    {year}
                  </th>
                ))}
                <th className="py-3 px-3 font-bold text-[var(--color-text)] text-center min-w-[70px] bg-[var(--color-surface-subtle)]/80">
                  10-Yr Total
                </th>
                <th className="py-3 px-3 font-bold text-[var(--color-text)] text-center min-w-[75px]">
                  5-Yr Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {filteredRows.map((row) => {
                return (
                  <tr
                    key={row.chapter}
                    className={
                      'hover:bg-[var(--color-surface-hover)]/40 transition-colors ' +
                      (selectedCell?.chapter === row.chapter ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : '')
                    }
                  >
                    <td
                      onClick={() =>
                        setSelectedCell(
                          selectedCell?.chapter === row.chapter && !selectedCell.year
                            ? null
                            : { chapter: row.chapter }
                        )
                      }
                      className="py-2.5 px-4 font-semibold text-[var(--color-text)] sticky left-0 bg-[var(--color-surface)] z-10 cursor-pointer group flex items-center justify-between"
                    >
                      <span className="truncate pr-2 group-hover:text-[var(--color-accent)] transition-colors">
                        {row.chapter}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[var(--color-accent)] shrink-0 transition-opacity" />
                    </td>

                    <td className="py-2.5 px-2 text-center text-[11px] text-[var(--color-text-muted)]">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                        {row.subject}
                      </span>
                    </td>

                    {years.map((year) => {
                      const marks = row.yearMarks[year] || 0;
                      const count = row.yearCounts[year] || 0;
                      const isCellSelected =
                        selectedCell?.chapter === row.chapter && selectedCell?.year === year;

                      return (
                        <td key={year} className="py-1.5 px-1.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCell(
                                isCellSelected ? null : { chapter: row.chapter, year }
                              )
                            }
                            title={row.chapter + ' (' + year + '): ' + marks + ' marks (' + count + ' questions)'}
                            className={'w-full py-1.5 rounded-md text-xs transition-all duration-150 flex flex-col items-center justify-center ' + getCellClass(marks, isCellSelected)}
                          >
                            <span>{marks > 0 ? (marks + 'm') : '—'}</span>
                          </button>
                        </td>
                      );
                    })}

                    <td
                      onClick={() =>
                        setSelectedCell(
                          selectedCell?.chapter === row.chapter && !selectedCell.year
                            ? null
                            : { chapter: row.chapter }
                        )
                      }
                      className="py-2.5 px-3 text-center font-bold text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-surface-subtle)] transition-colors"
                    >
                      <span className="px-2 py-1 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                        {row.totalMarks}m
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {row.trend === 'up' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Rising
                        </span>
                      )}
                      {row.trend === 'down' && (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded text-[11px]">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Dip
                        </span>
                      )}
                      {row.trend === 'steady' && (
                        <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)] font-medium bg-[var(--color-surface-subtle)] px-2 py-0.5 rounded text-[11px]">
                          <Minus className="w-3.5 h-3.5" />
                          Steady
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[var(--color-surface-subtle)] font-bold border-t border-[var(--color-border)]">
                <td className="py-3 px-4 text-[var(--color-text)] sticky left-0 bg-[var(--color-surface-subtle)] z-20">
                  Total Marks ({filteredRows.length} Chapters)
                </td>
                <td className="py-3 px-2 text-center text-[var(--color-text-muted)]">—</td>
                {years.map((year) => {
                  const colMarks = filteredRows.reduce((acc, r) => acc + (r.yearMarks[year] || 0), 0);
                  return (
                    <td key={year} className="py-3 px-1.5 text-center text-[var(--color-text)]">
                      {colMarks}m
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-center text-[var(--color-accent)] font-extrabold text-sm">
                  {grandTotalMarks}m
                </td>
                <td className="py-3 px-3 text-center text-[var(--color-text-muted)]">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {selectedCell && (
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-accent)]/30 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  {selectedCell.chapter}
                  {selectedCell.year ? (' — ' + selectedCell.year + ' Exam Questions') : ' — All 10 Years'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Showing {selectedQuestions.length} questions matching your heatmap selection
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear Selection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedQuestions.map((q) => (
              <ContentItemCard
                key={q.id}
                item={q}
                onClick={() => onSelectQuestion(q)}
                className="cursor-pointer hover:border-[var(--color-accent)] transition-all"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
