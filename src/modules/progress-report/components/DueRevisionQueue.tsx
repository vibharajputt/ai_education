// src/modules/progress-report/components/DueRevisionQueue.tsx
import React from 'react';
import type { ContentItem, ItemReviewState } from '@core';
import { Clock, Play, CheckCircle, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DueRevisionQueueProps {
  dueItems: Array<{
    item: ContentItem;
    reviewState?: ItemReviewState;
    isDue: boolean;
    dueInDays: number;
  }>;
  onLaunchPractice: () => void;
}

export function DueRevisionQueue({ dueItems, onLaunchPractice }: DueRevisionQueueProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-[var(--color-text)]">
              FSRS Spaced Repetition Due Queue
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Concepts and questions scheduled for memory consolidation review today.
          </p>
        </div>

        <button
          onClick={onLaunchPractice}
          disabled={dueItems.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-opacity"
        >
          <Play className="w-4 h-4 fill-current" />
          Practice Due Items ({dueItems.length})
        </button>
      </div>

      {dueItems.length === 0 ? (
        <div className="p-6 text-center space-y-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm text-[var(--color-text)]">
            All Caught Up!
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            Zero concepts are overdue for spaced repetition. Take a new quiz or generate a worksheet to expand your syllabus coverage.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)] max-h-72 overflow-y-auto pr-1">
          {dueItems.slice(0, 10).map(({ item, reviewState, dueInDays }, idx) => (
            <div
              key={item.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">
                    {item.chapter || 'Syllabus Topic'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {reviewState ? `${reviewState.reps} Reps` : 'Fresh Review'}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                  {item.body.replace(/[#*`$]/g, '')}
                </p>
              </div>

              <span className="text-xs font-semibold px-2 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                {dueInDays <= 0 ? 'Due Today' : `Due in ${dueInDays}d`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
