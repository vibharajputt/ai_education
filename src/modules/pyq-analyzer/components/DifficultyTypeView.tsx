import React, { useState, useMemo } from 'react';
import type { ContentItem } from '@core/types';
import type { ChapterDifficultyDist, ChapterTypeDist } from '../types';
import { Card } from '@components/Card';
import {
  Gauge,
  Brain,
} from 'lucide-react';

interface DifficultyTypeViewProps {
  difficultyDist: ChapterDifficultyDist[];
  typeDist: ChapterTypeDist[];
  items: ContentItem[];
}

export function DifficultyTypeView({
  difficultyDist,
  typeDist,
  items,
}: DifficultyTypeViewProps) {
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Science' | 'Mathematics'>('all');

  const filteredDiff = useMemo(() => {
    if (subjectFilter === 'all') return difficultyDist;
    return difficultyDist.filter((d) => d.subject === subjectFilter);
  }, [difficultyDist, subjectFilter]);

  const filteredType = useMemo(() => {
    if (subjectFilter === 'all') return typeDist;
    return typeDist.filter((t) => t.subject === subjectFilter);
  }, [typeDist, subjectFilter]);

  const summaryStats = useMemo(() => {
    const total = items.length || 1;
    let easy = 0, medium = 0, hard = 0;
    let conceptual = 0, numerical = 0, diagram = 0, application = 0;

    for (const it of items) {
      if (it.difficulty === 'easy') easy++;
      else if (it.difficulty === 'medium') medium++;
      else if (it.difficulty === 'hard') hard++;

      const cog = ((it.metadata || {}) as Record<string, unknown>).cognitiveType;
      if (cog === 'conceptual') conceptual++;
      else if (cog === 'numerical') numerical++;
      else if (cog === 'diagram') diagram++;
      else if (cog === 'application') application++;
    }

    return {
      easyPct: Math.round((easy / total) * 100),
      mediumPct: Math.round((medium / total) * 100),
      hardPct: Math.round((hard / total) * 100),
      conceptualPct: Math.round((conceptual / total) * 100),
      numericalPct: Math.round((numerical / total) * 100),
      diagramPct: Math.round((diagram / total) * 100),
      applicationPct: Math.round((application / total) * 100),
      total,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Easy Questions</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {summaryStats.easyPct}%
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Direct formula & definitions</div>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Moderate Questions</div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {summaryStats.mediumPct}%
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Multi-step derivations</div>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Hard / High-Cognition</div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {summaryStats.hardPct}%
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Application & proofs</div>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Numerical & Diagram</div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {summaryStats.numericalPct + summaryStats.diagramPct}%
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Visual & quantitative focus</div>
        </Card>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
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
          All Subjects ({difficultyDist.length} Chapters)
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                Difficulty Breakdown per Chapter
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Easy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Hard
              </span>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
            {filteredDiff.map((row) => (
              <div key={row.chapter} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text)] truncate max-w-[240px]">
                    {row.chapter}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] shrink-0 font-mono">
                    {row.total} qs ({row.easy}E / {row.medium}M / {row.hard}H)
                  </span>
                </div>

                <div className="h-3.5 w-full bg-[var(--color-surface-subtle)] rounded-full overflow-hidden flex border border-[var(--color-border)]">
                  <div
                    style={{ width: row.easyPct + '%' }}
                    className="bg-emerald-500 h-full transition-all"
                    title={'Easy: ' + row.easyPct + '% (' + row.easy + ')'}
                  />
                  <div
                    style={{ width: row.mediumPct + '%' }}
                    className="bg-amber-500 h-full transition-all"
                    title={'Medium: ' + row.mediumPct + '% (' + row.medium + ')'}
                  />
                  <div
                    style={{ width: row.hardPct + '%' }}
                    className="bg-rose-500 h-full transition-all"
                    title={'Hard: ' + row.hardPct + '% (' + row.hard + ')'}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                Cognitive Type Breakdown per Chapter
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Concept
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Numeric
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> Diagram
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> App
              </span>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
            {filteredType.map((row) => (
              <div key={row.chapter} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text)] truncate max-w-[240px]">
                    {row.chapter}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] shrink-0 font-mono">
                    {row.total} qs
                  </span>
                </div>

                <div className="h-3.5 w-full bg-[var(--color-surface-subtle)] rounded-full overflow-hidden flex border border-[var(--color-border)]">
                  <div
                    style={{ width: row.conceptualPct + '%' }}
                    className="bg-sky-500 h-full transition-all"
                    title={'Conceptual: ' + row.conceptualPct + '%'}
                  />
                  <div
                    style={{ width: row.numericalPct + '%' }}
                    className="bg-purple-500 h-full transition-all"
                    title={'Numerical: ' + row.numericalPct + '%'}
                  />
                  <div
                    style={{ width: row.diagramPct + '%' }}
                    className="bg-teal-500 h-full transition-all"
                    title={'Diagram: ' + row.diagramPct + '%'}
                  />
                  <div
                    style={{ width: row.applicationPct + '%' }}
                    className="bg-orange-500 h-full transition-all"
                    title={'Application: ' + row.applicationPct + '%'}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
