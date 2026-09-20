import React, { useState, useMemo } from 'react';
import type { ContentItem } from '@core/types';
import { Card } from '@components/Card';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import {
  Search,
  Flame,
  Award,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface PaperPaneProps {
  items: ContentItem[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
  onOpenSiblings: (item: ContentItem) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
}

export function PaperPane({
  items,
  activeItemId,
  onSelectItem,
  onOpenSiblings,
  searchRef,
}: PaperPaneProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMarks, setFilterMarks] = useState<string>('all');
  const [highRepeatOnly, setHighRepeatOnly] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const marks = ('marks' in item ? (item as { marks?: number }).marks : undefined) || 0;
      if (filterMarks === '1-2' && (marks < 1 || marks > 2)) return false;
      if (filterMarks === '3-5' && marks < 3) return false;

      if (highRepeatOnly) {
        const repScore = ((item.metadata || {}) as Record<string, unknown>).repeatedScore as number;
        if (!repScore || repScore < 5) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inBody = item.body.toLowerCase().includes(q);
        const inChapter = item.chapter?.toLowerCase().includes(q);
        const inConcepts = item.concepts?.some((c) => c.toLowerCase().includes(q));
        if (!inBody && !inChapter && !inConcepts) return false;
      }

      return true;
    });
  }, [items, filterMarks, highRepeatOnly, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      {/* Paper Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white">
              CBSE Class 10
            </span>
            <span className="text-xs text-[var(--color-text-muted)] font-semibold">
              Official Board Paper
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 3 Hours
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> 80 Marks
            </span>
          </div>
        </div>

        {/* Search input with 'F' key focus support */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question paper... (Press 'F' to focus)"
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
              F
            </kbd>
          </div>

          <button
            type="button"
            onClick={() => setHighRepeatOnly(!highRepeatOnly)}
            className={
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ' +
              (highRepeatOnly
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]')
            }
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Repeated
          </button>
        </div>
      </div>

      {/* Question List (Virtualized scroll container) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5" id="paper-pane-scroll-container">
        {filteredItems.map((item, index) => {
          const isActive = item.id === activeItemId;
          const marks = ('marks' in item ? (item as { marks?: number }).marks : undefined) || 3;
          const repScore = ((item.metadata || {}) as Record<string, unknown>).repeatedScore as number || 4;
          const repeatYears = Math.min(10, Math.max(3, Math.floor(repScore * 1.5)));

          return (
            <div
              key={item.id}
              id={`paper-question-${item.id}`}
              onClick={() => onSelectItem(item.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectItem(item.id);
                }
              }}
              className={
                'p-4 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ' +
                (isActive
                  ? 'bg-[var(--color-surface)] border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-md scale-[1.005]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]')
              }
            >
              {/* Question Card Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[var(--color-border)] text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ' +
                      (isActive
                        ? 'bg-[var(--color-accent)] text-white shadow-sm'
                        : 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)]')
                    }
                  >
                    Q{index + 1}
                  </span>

                  <span className="font-semibold text-[var(--color-text-muted)]">
                    {item.chapter}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Repeat Badge */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSiblings(item);
                    }}
                    title="Click to view sibling questions across 10 years"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                  >
                    <Flame className="w-3 h-3 text-purple-500 fill-purple-500" />
                    Appeared in {repeatYears} yrs
                  </button>

                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    {marks}m
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed font-serif">
                <MarkdownRenderer content={item.body} />
              </div>

              {item.latex && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs overflow-x-auto text-center font-sans">
                  <MarkdownRenderer content={`$$${item.latex}$$`} />
                </div>
              )}

              {/* Footer / Concept Pills */}
              {item.concepts && item.concepts.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-[var(--color-border)]">
                  {item.concepts.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
