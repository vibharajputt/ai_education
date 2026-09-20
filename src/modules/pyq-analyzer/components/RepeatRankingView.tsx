import React, { useState } from 'react';
import { ConceptRepeatItem } from '../types';
import { ChevronDown, ChevronUp, Repeat, Layers, BookOpen } from 'lucide-react';
import { ContentItemCard } from '@components/ContentItemCard';

interface RepeatRankingViewProps {
  concepts: ConceptRepeatItem[];
  onSelectQuestion?: (itemId: string) => void;
}

export const RepeatRankingView: React.FC<RepeatRankingViewProps> = ({
  concepts,
  onSelectQuestion,
}) => {
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  const toggleExpand = (conceptName: string) => {
    setExpandedConcept((prev) => (prev === conceptName ? null : conceptName));
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] font-medium">
        <span className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
          <Repeat className="w-4 h-4 text-[var(--color-accent)]" />
          Ranked Concept Repeat Frequencies (2015 - 2024)
        </span>
        <span>{concepts.length} Recurring Core Concepts</span>
      </div>

      {/* Concept Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {concepts.map((item, idx) => {
          const isExpanded = expandedConcept === item.concept;

          return (
            <div
              key={item.concept}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm transition-all"
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(item.concept)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-[var(--color-surface-subtle)]/60 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-[var(--color-surface-subtle)] text-[11px] font-bold text-[var(--color-text-muted)] inline-flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--color-text)] truncate">
                      {item.concept}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] font-medium">
                      {item.chapter}
                    </span>
                  </div>

                  {/* Year Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] text-[var(--color-text-muted)] font-medium mr-1">
                      Appeared Years:
                    </span>
                    {item.yearsAppeared.map((year) => (
                      <span
                        key={year}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold border border-sky-500/20"
                      >
                        {year}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      In {item.appearanceCount} of 10 Years
                    </span>
                    <div className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                      Avg: {item.avgMarks} Marks / exam
                    </div>
                  </div>

                  <a
                    href={`/#/school/sheet-generator?chapter=${encodeURIComponent(item.chapter)}&concept=${encodeURIComponent(item.concept)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Generate Worksheet</span>
                  </a>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Sibling Questions Side-by-Side View */}
              {isExpanded && (
                <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)]/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      Sibling Questions Across Board Papers ({item.siblingQuestions.length})
                    </span>
                    <span>Compare year-over-year framing</span>
                  </div>

                  {/* Horizontal / Grid Sibling Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {item.siblingQuestions.map((q) => {
                      const qYear = (q as any).year || 2020;
                      const qMarks = (q as any).marks || 3;

                      return (
                        <div
                          key={q.id}
                          className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold text-[11px]">
                                {qYear} CBSE
                              </span>
                              <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                                {qMarks} Marks • {q.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text)] font-medium line-clamp-4 leading-relaxed">
                              {q.body}
                            </p>
                          </div>

                          {onSelectQuestion && (
                            <button
                              type="button"
                              onClick={() => onSelectQuestion(q.id)}
                              className="w-full mt-2 py-1 px-2 rounded text-[11px] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <BookOpen className="w-3 h-3" /> Inspect in Browser
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
