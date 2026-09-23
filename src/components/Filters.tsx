// src/components/Filters.tsx
import React from 'react';
import { X } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  values: string[];
}

interface FiltersProps {
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

  const hasAny = Object.values(selected).some((v) => v.length > 0);

  const clearAll = () => {
    const cleared = Object.fromEntries(Object.keys(selected).map((k) => [k, []]));
    onChange(cleared);
  };

  return (
    <div className={`flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3.5 ${className}`} role="group" aria-label="Filters">
      {options.map((opt) => (
        <div key={opt.key} className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wider mr-1">
            {opt.label}:
          </span>
          <div className="flex flex-wrap gap-1">
            {opt.values.map((val) => {
              const isActive = (selected[opt.key] ?? []).includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggle(opt.key, val)}
                  aria-pressed={isActive}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs scale-105'
                      : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {hasAny && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors sm:ml-auto cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
