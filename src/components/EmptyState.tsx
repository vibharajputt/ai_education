import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="text-ink-subtle mb-4" aria-hidden>
          {icon}
        </div>
      )}
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-ink-muted max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium bg-accent text-white rounded hover:bg-accent-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
