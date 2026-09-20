import React from 'react';
import type { ContentItem } from '@core/types';
import { BottomSheet } from '@components/BottomSheet';

interface QuestionJumpSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
}

export function QuestionJumpSheet({
  isOpen,
  onClose,
  items,
  activeItemId,
  onSelectItem,
}: QuestionJumpSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Jump to Question">
      <div className="space-y-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          Tap any question number to navigate directly:
        </p>

        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5">
          {items.map((it, idx) => {
            const isActive = it.id === activeItemId;
            const marks = ('marks' in it ? (it as { marks?: number }).marks : undefined) || 3;

            return (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  onSelectItem(it.id);
                  onClose();
                }}
                className={
                  'p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ' +
                  (isActive
                    ? 'bg-[var(--color-accent)] text-white shadow-md scale-105'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)]')
                }
              >
                <span>Q{idx + 1}</span>
                <span className="text-[10px] opacity-70 font-normal">{marks}m</span>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
