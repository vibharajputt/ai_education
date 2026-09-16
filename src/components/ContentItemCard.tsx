import React from 'react';
import type { ContentItem } from '@core/types';
import { Card } from './Card';
import { Badge } from './Badge';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

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

  return (
    <Card
      onClick={onClick}
      className={`p-5 flex flex-col justify-between transition-all duration-150 hover:border-[var(--color-border-hover)] ${className}`}
    >
      <div>
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge label={item.kind} variant="kind" />
            {item.difficulty && (
              <Badge label={item.difficulty} variant="difficulty" />
            )}
            {isQuestion && item.marks && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                {item.marks} marks
              </span>
            )}
            {isQuestion && item.year && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                {item.year}
              </span>
            )}
          </div>
          {(item.subject || item.chapter) && (
            <span className="text-xs text-[var(--color-text-muted)] font-medium">
              {[item.subject, item.chapter].filter(Boolean).join(' • ')}
            </span>
          )}
        </div>

        {/* Item body */}
        <div className="mb-4">
          <MarkdownRenderer content={item.body} />
        </div>

        {/* Optional LaTeX display block */}
        {item.latex && (
          <div className="my-3 p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] overflow-x-auto">
            <MarkdownRenderer content={`$$${item.latex}$$`} />
          </div>
        )}

        {/* Concept pills */}
        {item.concepts && item.concepts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[var(--color-border)]">
            <Tag className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0 mr-0.5" />
            {item.concepts.map((concept) => (
              <span
                key={concept}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      {onExplain && (
        <div className="mt-4 pt-3 flex items-center justify-end border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExplain(item);
            }}
            disabled={isExplaining}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isExplaining ? 'Explaining...' : 'Explain this'}
          </button>
        </div>
      )}
    </Card>
  );
}
