import React from 'react';
import { Split, RefreshCw, Search, Grid, Info, Sparkles } from 'lucide-react';

interface SplitViewToolbarProps {
  scopeLabel: string;
  scrollSync: boolean;
  onToggleScrollSync: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenJumpSheet: () => void;
  focusedIndex: number;
  totalCount: number;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const SplitViewToolbar: React.FC<SplitViewToolbarProps> = ({
  scopeLabel,
  scrollSync,
  onToggleScrollSync,
  searchQuery,
  onSearchChange,
  onOpenJumpSheet,
  focusedIndex,
  totalCount,
  searchInputRef,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
      {/* Title & Scope Label */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] shrink-0">
          <Split className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-[var(--color-text)] leading-none">
              Split-Screen Exam Workspace
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Q{focusedIndex + 1} of {totalCount}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">
            {scopeLabel}
          </p>
        </div>
      </div>

      {/* Center/Right Toolbar Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search Input (Keyboard Shortcut F) */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search paper (Press F)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Scroll Sync Toggle Button */}
        <button
          type="button"
          onClick={onToggleScrollSync}
          title="Toggle synchronized scrolling between Paper and Explanation"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            scrollSync
              ? 'bg-[var(--color-accent)] text-white border-transparent shadow-xs'
              : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scrollSync ? 'animate-spin-slow' : ''}`} />
          <span>Scroll-Sync {scrollSync ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mobile Jump Sheet Button */}
        <button
          type="button"
          onClick={onOpenJumpSheet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-semibold hover:bg-[var(--color-surface-hover)] transition-colors md:hidden"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Jump to Q</span>
        </button>

        {/* Unobtrusive AI Disclaimer Note (Mandatory Feature) */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] font-medium px-2 py-1 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
          <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
          <span>AI-generated — verify with your teacher</span>
        </div>
      </div>
    </div>
  );
};
