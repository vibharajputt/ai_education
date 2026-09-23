// src/components/Filters.tsx
import React from 'react';
import { X, SlidersHorizontal, BookOpen, Gauge, Tag, Check } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  values: string[];
}

export interface FiltersProps {
  options: FilterOption[];
  selected: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
  className?: string;
}

export function Filters({ options, selected, onChange, className = '' }: FiltersProps) {
  const toggle = (key: string, value: string) => {
    const current = selected[key] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...selected, [key]: next });
  };

  const totalActive = Object.values(selected).reduce((acc, curr) => acc + curr.length, 0);

  const clearAll = () => {
    const cleared = Object.fromEntries(Object.keys(selected).map((k) => [k, []]));
    onChange(cleared);
  };

  // Helper to format values nicely
  const formatLabel = (val: string) => {
    if (val.toLowerCase() === 'easy') return 'Easy';
    if (val.toLowerCase() === 'medium') return 'Medium';
    if (val.toLowerCase() === 'hard') return 'Hard';
    return val;
  };

  // Icon for category
  const getCategoryIcon = (key: string) => {
    const lower = key.toLowerCase();
    if (lower.includes('subject') || lower.includes('topic')) {
      return <BookOpen className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (lower.includes('difficulty') || lower.includes('level')) {
      return <Gauge className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <Tag className="w-3.5 h-3.5 text-purple-500" />;
  };

  // Difficulty pill styling
  const getPillStyle = (key: string, val: string, isActive: boolean) => {
    const valLower = val.toLowerCase();
    if (key.toLowerCase().includes('difficulty')) {
      if (valLower === 'easy') {
        return isActive
          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 border-emerald-600 ring-2 ring-emerald-500/20'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20';
      }
      if (valLower === 'medium') {
        return isActive
          ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/25 border-amber-600 ring-2 ring-amber-500/20'
          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20';
      }
      if (valLower === 'hard') {
        return isActive
          ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/25 border-rose-600 ring-2 ring-rose-500/20'
          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20';
      }
    }

    return isActive
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 border-transparent ring-2 ring-blue-500/20 font-bold'
      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-blue-500/40 hover:bg-[var(--color-surface-hover)]';
  };

  const getDifficultyDot = (val: string) => {
    const valLower = val.toLowerCase();
    if (valLower === 'easy') return <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />;
    if (valLower === 'medium') return <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />;
    if (valLower === 'hard') return <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />;
    return null;
  };

  return (
    <div
      className={`rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs transition-all ${className}`}
      role="group"
      aria-label="Filter Controls"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)]">
              Filter By Category & Level
            </h3>
          </div>
        </div>

        {totalActive > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
              {totalActive} {totalActive === 1 ? 'Filter' : 'Filters'} Active
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {options.map((opt) => {
          const isDifficulty = opt.key.toLowerCase().includes('difficulty');

          return (
            <div
              key={opt.key}
              className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2.5"
            >
              {/* Facet Title */}
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                {getCategoryIcon(opt.key)}
                <span>{opt.label}</span>
              </div>

              {/* Option Pills */}
              <div className="flex flex-wrap gap-1.5">
                {opt.values.map((val) => {
                  const isActive = (selected[opt.key] ?? []).includes(val);
                  const pillCls = getPillStyle(opt.key, val, isActive);
                  const dot = isDifficulty ? getDifficultyDot(val) : null;

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => toggle(opt.key, val)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer active:scale-95 ${pillCls}`}
                    >
                      {dot}
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{formatLabel(val)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
