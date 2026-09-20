import React, { useState } from 'react';
import { ChapterStats } from '../types';
import { BarChart2, PieChart } from 'lucide-react';

interface DifficultyTypeViewProps {
  stats: ChapterStats[];
}

export const DifficultyTypeView: React.FC<DifficultyTypeViewProps> = ({ stats }) => {
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Science' | 'Mathematics'>('All');

  const filteredStats = stats.filter(
    (s) => selectedSubject === 'All' || s.subject === selectedSubject
  );

  // Overall sums for compact summary breakdown
  const totals = filteredStats.reduce(
    (acc, curr) => {
      acc.easy += curr.easyCount;
      acc.medium += curr.mediumCount;
      acc.hard += curr.hardCount;
      acc.conceptual += curr.conceptualCount;
      acc.numerical += curr.numericalCount;
      acc.diagram += curr.diagramCount;
      acc.application += curr.applicationCount;
      acc.total += curr.totalQuestions;
      return acc;
    },
    {
      easy: 0,
      medium: 0,
      hard: 0,
      conceptual: 0,
      numerical: 0,
      diagram: 0,
      application: 0,
      total: 0,
    }
  );

  const totalAll = totals.total || 1;

  return (
    <div className="space-y-6">
      {/* Subject Filter Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          <BarChart2 className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Difficulty & Question Nature Distribution</span>
        </div>

        <div className="flex items-center gap-1">
          {(['All', 'Science', 'Mathematics'] as const).map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedSubject === sub
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Two Compact Print/Screenshot Readable Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Difficulty Breakdown */}
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-sm print:break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-500" />
              1. Difficulty Level Distribution
            </h3>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">
              {totals.total} Total Questions
            </span>
          </div>

          {/* Compact Stacked Proportion Bar (No load animation) */}
          <div className="w-full h-5 rounded-lg overflow-hidden flex bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
            <div
              style={{ width: `${(totals.easy / totalAll) * 100}%` }}
              className="bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center"
              title={`Easy: ${totals.easy}`}
            >
              {Math.round((totals.easy / totalAll) * 100)}%
            </div>
            <div
              style={{ width: `${(totals.medium / totalAll) * 100}%` }}
              className="bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center"
              title={`Moderate: ${totals.medium}`}
            >
              {Math.round((totals.medium / totalAll) * 100)}%
            </div>
            <div
              style={{ width: `${(totals.hard / totalAll) * 100}%` }}
              className="bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center"
              title={`Hard: ${totals.hard}`}
            >
              {Math.round((totals.hard / totalAll) * 100)}%
            </div>
          </div>

          {/* Legend Table */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-emerald-700 dark:text-emerald-300 font-bold">Easy</div>
              <div className="text-sm font-black text-[var(--color-text)]">{totals.easy}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-amber-700 dark:text-amber-300 font-bold">Moderate</div>
              <div className="text-sm font-black text-[var(--color-text)]">{totals.medium}</div>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="text-rose-700 dark:text-rose-300 font-bold">Hard</div>
              <div className="text-sm font-black text-[var(--color-text)]">{totals.hard}</div>
            </div>
          </div>
        </div>

        {/* Chart 2: Question Type Nature Breakdown */}
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-sm print:break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-sky-500" />
              2. Question Nature Breakdown
            </h3>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">
              4 Cognitive Categories
            </span>
          </div>

          {/* Compact Stacked Proportion Bar */}
          <div className="w-full h-5 rounded-lg overflow-hidden flex bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
            <div
              style={{ width: `${(totals.conceptual / totalAll) * 100}%` }}
              className="bg-sky-500 text-white text-[10px] font-extrabold flex items-center justify-center"
              title={`Conceptual: ${totals.conceptual}`}
            >
              {Math.round((totals.conceptual / totalAll) * 100)}%
            </div>
            <div
              style={{ width: `${(totals.numerical / totalAll) * 100}%` }}
              className="bg-purple-500 text-white text-[10px] font-extrabold flex items-center justify-center"
              title={`Numerical: ${totals.numerical}`}
            >
              {Math.round((totals.numerical / totalAll) * 100)}%
            </div>
            <div
              style={{ width: `${(totals.diagram / totalAll) * 100}%` }}
              className="bg-indigo-500 text-white text-[10px] font-extrabold flex items-center justify-center"
              title={`Diagram: ${totals.diagram}`}
            >
              {Math.round((totals.diagram / totalAll) * 100)}%
            </div>
            <div
              style={{ width: `${(totals.application / totalAll) * 100}%` }}
              className="bg-teal-500 text-white text-[10px] font-extrabold flex items-center justify-center"
              title={`Application: ${totals.application}`}
            >
              {Math.round((totals.application / totalAll) * 100)}%
            </div>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <div className="text-sky-700 dark:text-sky-300 font-bold text-[11px]">Concept</div>
              <div className="text-sm font-black text-[var(--color-text)]">{totals.conceptual}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-purple-700 dark:text-purple-300 font-bold text-[11px]">Numeric</div>
              <div className="text-sm font-black text-[var(--color-text)]">{totals.numerical}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">Diagram</div>
              <div className="text-sm font-black text-[var(--color-text)]">{totals.diagram}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <div className="text-teal-700 dark:text-teal-300 font-bold text-[11px]">Apply</div>
              <div className="text-sm font-black text-[var(--color-text)]">{totals.application}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Chapter Distribution Matrix Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5 min-w-[220px]">Chapter</th>
              <th className="py-3 px-2 text-center">Subject</th>
              <th className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400">Easy</th>
              <th className="py-3 px-2 text-center text-amber-600 dark:text-amber-400">Med</th>
              <th className="py-3 px-2 text-center text-rose-600 dark:text-rose-400">Hard</th>
              <th className="py-3 px-2 text-center text-sky-600 dark:text-sky-400">Conceptual</th>
              <th className="py-3 px-2 text-center text-purple-600 dark:text-purple-400">Numerical</th>
              <th className="py-3 px-2 text-center text-indigo-600 dark:text-indigo-400">Diagram</th>
              <th className="py-3 px-2 text-center text-teal-600 dark:text-teal-400">Application</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] font-medium">
            {filteredStats.map((row) => (
              <tr key={row.chapter} className="hover:bg-[var(--color-surface-subtle)]/50 transition-colors">
                <td className="py-2.5 px-3.5 font-semibold text-[var(--color-text)]">{row.chapter}</td>
                <td className="py-2.5 px-2 text-center">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
                    {row.subject}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400">{row.easyCount}</td>
                <td className="py-2.5 px-2 text-center font-bold text-amber-600 dark:text-amber-400">{row.mediumCount}</td>
                <td className="py-2.5 px-2 text-center font-bold text-rose-600 dark:text-rose-400">{row.hardCount}</td>
                <td className="py-2.5 px-2 text-center font-bold text-sky-600 dark:text-sky-400">{row.conceptualCount}</td>
                <td className="py-2.5 px-2 text-center font-bold text-purple-600 dark:text-purple-400">{row.numericalCount}</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-600 dark:text-indigo-400">{row.diagramCount}</td>
                <td className="py-2.5 px-2 text-center font-bold text-teal-600 dark:text-teal-400">{row.applicationCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
