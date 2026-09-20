import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

type Status = 'loading' | 'empty' | 'error' | 'success';

interface StateShellProps {
  status?: Status;
  state?: Status | string;
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyAction?: { label: string; onClick: () => void };
  children?: ReactNode;
  /** Number of skeleton lines when loading. Default 4. */
  skeletonLines?: number;
  className?: string;
}

/**
 * Composes the three required states (loading / empty / error) that every
 * module must implement (AGENTS.md non-negotiable rule).
 *
 * Usage:
 *   <StateShell status={loading ? 'loading' : items.length === 0 ? 'empty' : error ? 'error' : 'success'} error={error} onRetry={reload}>
 *     {items.map(…)}
 *   </StateShell>
 */
export function StateShell({
  status,
  state,
  title,
  message,
  error,
  onRetry,
  emptyTitle = 'No content yet',
  emptyDescription,
  emptyIcon,
  emptyAction,
  children,
  skeletonLines = 4,
  className = '',
}: StateShellProps) {
  const effectiveStatus = (status || state || 'success') as Status;
  const effectiveEmptyTitle = title || emptyTitle;
  const effectiveEmptyDesc = message || emptyDescription;

  if (effectiveStatus === 'loading') {
    return (
      <div className={`p-6 ${className}`}>
        <Skeleton lines={skeletonLines} />
      </div>
    );
  }

  if (effectiveStatus === 'error') {
    return (
      <ErrorState
        error={error ?? undefined}
        title={title}
        message={message}
        retry={onRetry}
        className={className}
      />
    );
  }

  if (effectiveStatus === 'empty') {
    return (
      <EmptyState
        icon={emptyIcon}
        title={effectiveEmptyTitle}
        description={effectiveEmptyDesc}
        action={emptyAction}
        className={className}
      />
    );
  }

  // status === 'success'
  return <>{children}</>;
}
