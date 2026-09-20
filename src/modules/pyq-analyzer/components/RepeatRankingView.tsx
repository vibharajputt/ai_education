import React, { useState, useMemo } from 'react';
import type { ContentItem } from '@core/types';
import { ConceptRanking, getItemYear, getItemMarks } from '../types';
import { Card } from '@components/Card';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Layers,
} from 'lucide-react';

interface RepeatRankingViewProps {
  rankings: ConceptRanking[];
  allYears: number[];
  onSelectQuestion: (item: ContentItem) => void;
}

export function RepeatRankingView({
  rankings,
  allYears,
  onSelectQuestion,
}: RepeatRankingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Science' | 'Mathematics'>('all');
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  const filteredRankings = useMemo(() => {
    return rankings.filter((item) => {
      if (subjectFilter !== 'all' && item.subject !== subjectFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchConcept = item.concept.toLowerCase().includes(q);
        const matchChapter = item.chapter.toLowerCase().includes(q);
        if (!matchConcept && !matchChapter) return false;
      }
      return true;
    });
  }, [rankings, subjectFilter, searchQuery]);

  const toggleExpand = (concept: string) => {
    setExpandedConcept((prev) => (prev === concept ? null : concept));
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
            All Concepts ({rankings.length})
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
            Science
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
            Mathematics
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts or chapters..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredRankings.map((rank, index) => {
          const isExpanded = expandedConcept === rank.concept;
          const isCoreHighYield = rank.distinctYearsCount >= 8;
          const isFrequent = rank.distinctYearsCount >= 5 && rank.distinctYearsCount < 8;

          return (
            <Card
              key={rank.concept}
              className={
                'p-5 transition-all border ' +
                (isExpanded
                  ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]')
              }
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)]">
                      #{index + 1}
                    </span>

                    <h3 className="text-sm font-bold text-[var(--color-text)]">
                      {rank.concept}
                    </h3>

                    {isCoreHighYield && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        High Yield ({rank.distinctYearsCount}/10 Years)
                      </span>
                    )}

                    {isFrequent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Frequent ({rank.distinctYearsCount}/10 Years)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)]">
                    {rank.subject} • <span className="text-[var(--color-text)] font-medium">{rank.chapter}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[11px] text-[var(--color-text-muted)] font-medium mr-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Appeared in:
                    </span>
                    {allYears.map((y) => {
                      const appeared = rank.appearedYears.includes(y);
                      return (
                        <span
                          key={y}
                          className={
                            'text-[10px] px-2 py-0.5 rounded font-mono font-medium ' +
                            (appeared
                              ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold border border-[var(--color-accent)]/30'
                              : 'bg-[var(--color-surface-subtle)]/40 text-[var(--color-text-muted)]/50 opacity-40 line-through')
                          }
                        >
                          {y}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--color-border)] shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[var(--color-text)]">
                      {rank.avgMarks} avg marks
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {rank.totalQuestions} board questions
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(rank.concept)}
                    className={
                      'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ' +
                      (isExpanded
                        ? 'bg-[var(--color-accent)] text-white shadow-sm'
                        : 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]')
                    }
                  >
                    <span>{isExpanded ? 'Hide Sibling PYQs' : ('View ' + rank.questions.length + ' Sibling PYQs')}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-5 pt-4 border-t border-[var(--color-border)] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    <Layers className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    Multi-Year Board Questions for &quot;{rank.concept}&quot;
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rank.questions.map((q) => {
                      const qYear = getItemYear(q);
                      const qMarks = getItemMarks(q);
                      return (
                        <div
                          key={q.id}
                          onClick={() => onSelectQuestion(q)}
                          className="p-4 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] cursor-pointer transition-all space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                                {qYear} Board Exam
                              </span>
                              <span className="text-[var(--color-text-muted)] font-medium">
                                {qMarks} Marks • {q.difficulty}
                              </span>
                            </div>

                            <div className="text-xs text-[var(--color-text)] line-clamp-3">
                              <MarkdownRenderer content={q.body} />
                            </div>

                            {q.latex && (
                              <div className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs overflow-x-auto">
                                <MarkdownRenderer content={'$$' + q.latex + '$$'} />
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px]">
                            <span className="text-[var(--color-text-muted)] capitalize">
                              {(q.metadata as Record<string, unknown>)?.cognitiveType as string || 'Conceptual'}
                            </span>
                            <span className="font-semibold text-[var(--color-accent)]">
                              Inspect Details →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
