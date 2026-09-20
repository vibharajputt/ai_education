import React from 'react';
import type { ContentItem } from '@core/types';
import { Drawer } from '@components/Drawer';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Flame, Calendar, Award, Tag } from 'lucide-react';

interface SiblingQuestionsDrawerProps {
  item: ContentItem | null;
  onClose: () => void;
  allQuestions: ContentItem[];
  onSelectSibling: (item: ContentItem) => void;
}

export function SiblingQuestionsDrawer({
  item,
  onClose,
  allQuestions,
  onSelectSibling,
}: SiblingQuestionsDrawerProps) {
  if (!item) return null;

  const concepts = item.concepts || [];
  const siblings = allQuestions.filter(
    (q) => q.id !== item.id && q.concepts?.some((c) => concepts.includes(c))
  );

  return (
    <Drawer
      isOpen={Boolean(item)}
      onClose={onClose}
      title={`Multi-Year Recurrence: ${concepts[0] || item.chapter}`}
    >
      <div className="space-y-6 pb-8">
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
            <Flame className="w-4 h-4 fill-purple-500 text-purple-500" />
            Recurrence Intelligence (Appeared in {Math.min(10, siblings.length + 1)} of 10 Years)
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            This core concept is heavily prioritized by the CBSE examination board. Below are the sibling questions asked in previous years.
          </p>
        </div>

        <div className="space-y-3">
          {siblings.map((sib) => {
            const sibMarks = ('marks' in sib ? (sib as { marks?: number }).marks : undefined) || 3;
            const sibYear = ('year' in sib ? (sib as { year?: number }).year : undefined) || 2023;

            return (
              <div
                key={sib.id}
                onClick={() => onSelectSibling(sib)}
                className="p-4 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                    {sibYear} Board Exam
                  </span>
                  <span className="text-[var(--color-text-muted)] font-semibold">
                    {sibMarks} Marks • {sib.difficulty}
                  </span>
                </div>

                <div className="text-xs text-[var(--color-text)] line-clamp-3 leading-relaxed">
                  <MarkdownRenderer content={sib.body} />
                </div>

                {sib.latex && (
                  <div className="p-2 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs overflow-x-auto text-center">
                    <MarkdownRenderer content={`$$${sib.latex}$$`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}
