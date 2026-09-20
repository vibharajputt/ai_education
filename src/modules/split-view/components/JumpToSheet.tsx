import React from 'react';
import { BottomSheet } from '@components/BottomSheet';
import { ContentItem } from '@core/types';

interface JumpToSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  focusedIndex: number;
  onSelectIndex: (idx: number) => void;
}

export const JumpToSheet: React.FC<JumpToSheetProps> = ({
  isOpen,
  onClose,
  items,
  focusedIndex,
  onSelectIndex,
}) => {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Jump to Question"
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--color-text-muted)] font-medium">
          Select any question number to jump directly on the paper.
        </p>

        {/* 40-Question Quick Jump Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-[50vh] overflow-y-auto p-1">
          {items.map((item, idx) => {
            const isSelected = focusedIndex === idx;
            const marks = (item as any).marks || 3;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectIndex(idx);
                  onClose();
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-white border-transparent shadow-md scale-105'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
              >
                <span>Q{idx + 1}</span>
                <span className="text-[9px] font-normal opacity-80">{marks}m</span>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
};
