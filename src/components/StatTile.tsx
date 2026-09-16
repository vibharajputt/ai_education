import React from 'react';
import { Card } from './Card';

interface StatTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatTile({
  label,
  value,
  subtext,
  icon,
  trend,
  className = '',
}: StatTileProps) {
  return (
    <Card className={`p-4 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="p-1.5 rounded-md bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isPositive
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-error)]'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {subtext}
        </p>
      )}
    </Card>
  );
}
