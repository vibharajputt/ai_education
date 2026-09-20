import React from 'react';
import { Keyboard } from 'lucide-react';

export function KeyboardShortcutHelper() {
  return (
    <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] shadow-sm select-none">
      <span className="flex items-center gap-1 font-semibold text-[var(--color-text)]">
        <Keyboard className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Shortcuts:
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[10px] font-mono">J</kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[10px] font-mono">K</kbd>
        Next/Prev
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[10px] font-mono">S</kbd>
        Toggle Solution
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[10px] font-mono">F</kbd>
        Search
      </span>
    </div>
  );
}
