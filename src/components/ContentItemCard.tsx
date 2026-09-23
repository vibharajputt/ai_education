// src/components/ContentItemCard.tsx
import React from 'react';
import type { ContentItem } from '@core/types';
import { Card } from './Card';
import { Badge } from './Badge';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Sparkles, Tag, Lightbulb, BookOpen, Atom, Zap, Compass, Dna } from 'lucide-react';

interface ContentItemCardProps {
  item: ContentItem;
  onExplain?: (item: ContentItem) => void;
  isExplaining?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ContentItemCard({
  item,
  onExplain,
  isExplaining = false,
  onClick,
  className = '',
}: ContentItemCardProps) {
  const isQuestion = item.kind === 'question';
  const isMnemonic = item.kind === 'mnemonic';
  const hookText = typeof item.metadata?.hook === 'string' ? item.metadata.hook : undefined;

  // Subject theme helper
  const getSubjectTheme = (subject?: string) => {
    switch (subject?.toLowerCase()) {
      case 'physics':
        return {
          badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          icon: <Zap className="w-3.5 h-3.5 text-indigo-500" />,
          border: 'hover:border-indigo-500/40',
        };
      case 'chemistry':
        return {
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          icon: <Atom className="w-3.5 h-3.5 text-emerald-500" />,
          border: 'hover:border-emerald-500/40',
        };
      case 'mathematics':
      case 'maths':
        return {
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: <Compass className="w-3.5 h-3.5 text-amber-500" />,
          border: 'hover:border-amber-500/40',
        };
      case 'biology':
        return {
          badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
          icon: <Dna className="w-3.5 h-3.5 text-teal-500" />,
          border: 'hover:border-teal-500/40',
        };
      default:
        return {
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" />,
          border: 'hover:border-blue-500/40',
        };
    }
  };

  const subjectTheme = getSubjectTheme(item.subject);

  return (
    <Card
      onClick={onClick}
      className={`p-5 sm:p-6 flex flex-col justify-between rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-200 ${subjectTheme.border} ${className}`}
    >
      <div>
        {/* Header Badges & Subject Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 pb-3 border-b border-[var(--color-border)]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Kind badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
              {isMnemonic ? '🧠 MNEMONIC HOOK' : item.kind.toUpperCase()}
            </span>

            {/* Difficulty badge */}
            {item.difficulty && (
              <Badge label={item.difficulty} variant="difficulty" />
            )}

            {/* Marks or Year if question */}
            {isQuestion && item.marks && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {item.marks} Marks
              </span>
            )}
            {isQuestion && item.year && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                CBSE {item.year}
              </span>
            )}
          </div>

          {/* Subject and Chapter indicator */}
          {(item.subject || item.chapter) && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${subjectTheme.badge}`}>
              {subjectTheme.icon}
              <span>{[item.subject, item.chapter].filter(Boolean).join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Card Body Markdown */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-[var(--color-text)] leading-relaxed mb-4">
          <MarkdownRenderer content={item.body} />
        </div>

        {/* Optional standalone LaTeX display block */}
        {item.latex && (
          <div className="my-3.5 p-3.5 rounded-xl bg-gradient-to-r from-[var(--color-surface-subtle)] to-[var(--color-surface)] border border-[var(--color-border)] overflow-x-auto shadow-inner">
            <MarkdownRenderer content={`$$${item.latex}$$`} />
          </div>
        )}

        {/* Metadata Hook Callout Box if present */}
        {hookText && (
          <div className="my-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25 flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <strong className="text-amber-800 dark:text-amber-300 font-extrabold uppercase tracking-wide block mb-0.5">
                Memory Anchor Hook
              </strong>
              <span className="text-[var(--color-text)] font-semibold italic">
                "{hookText}"
              </span>
            </div>
          </div>
        )}

        {/* Concept pills */}
        {item.concepts && item.concepts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-[var(--color-border)]">
            <Tag className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0 mr-1" />
            {item.concepts.map((concept) => (
              <span
                key={concept}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] font-semibold border border-[var(--color-border)] hover:text-[var(--color-text)] transition-colors"
              >
                {concept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      {onExplain && (
        <div className="mt-5 pt-3.5 flex items-center justify-between border-t border-[var(--color-border)]">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] hidden sm:inline">
            Need a detailed derivation or example?
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExplain(item);
            }}
            disabled={isExplaining}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 ml-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isExplaining ? 'AI Thinking...' : '✨ Explain with AI Tutor'}</span>
          </button>
        </div>
      )}
    </Card>
  );
}
