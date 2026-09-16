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
    <div className={`flex flex-wrap items-start gap-4 ${className}`} role="group" aria-label="Filters">
      {options.map((opt) => (
        <div key={opt.key} className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-ink-muted uppercase tracking-wide mr-1">
            {opt.label}
          </span>
          {opt.values.map((val) => {
            const isActive = (selected[opt.key] ?? []).includes(val);
            return (
              <button
                key={val}
                onClick={() => toggle(opt.key, val)}
                aria-pressed={isActive}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  isActive
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface text-ink-muted border-line hover:border-line-strong hover:text-ink'
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
      ))}
      {hasAny && (
        <button
          onClick={clearAll}
          className="text-xs text-ink-muted hover:text-danger underline ml-auto self-center"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
