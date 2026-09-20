import React from 'react';
import { Drawer } from '@components/Drawer';
import { ContentItem } from '@core/types';
import { Layers, Calendar, BookOpen } from 'lucide-react';

interface SiblingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  siblingYears: number[];
  onSelectSibling: (year: number) => void;
}

export const SiblingDrawer: React.FC<SiblingDrawerProps> = ({
  isOpen,
  onClose,
  item,
  siblingYears,
  onSelectSibling,
}) => {
  if (!item) return null;

  const marks = (item as any).marks || 3;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Board Exam Sibling Questions Across Years"
    >
      <div className="space-y-4">
        {/* Context Item Header */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] uppercase">
            <Layers className="w-4 h-4" />
            <span>Core Concept: {item.concepts[0] || item.chapter}</span>
          </div>
          <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">
            {item.body}
          </p>
        </div>

        <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          Appeared in {siblingYears.length} Previous Board Exams
        </div>

        {/* Sibling Questions Grid */}
        <div className="space-y-2.5">
          {siblingYears.map((yr) => (
            <div
              key={yr}
              className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2 hover:border-[var(--color-accent)]/50 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 font-extrabold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {yr} CBSE Board Exam
                </span>
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  {marks} Marks Allocated
                </span>
              </div>

              <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">
                [{yr} Variant] Re-framed question testing {item.concepts[0] || item.chapter}. State definitions, derive mathematical equations, and compute final values.
              </p>

              <button
                type="button"
                onClick={() => {
                  onSelectSibling(yr);
                  onClose();
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Jump to {yr} Exam Question
              </button>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};
