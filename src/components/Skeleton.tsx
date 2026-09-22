interface SkeletonProps {
  /** Number of skeleton text lines to render. */
  lines?: number;
  className?: string;
  /** Render as a block (non-text skeleton). */
  block?: boolean;
  height?: string;
}

export function Skeleton({
  lines = 3,
  className = '',
  block = false,
  height = 'h-4',
}: SkeletonProps) {
  if (block) {
    return (
      <div
        aria-hidden
        className={`animate-shimmer rounded ${height} ${className}`}
      />
    );
  }

  return (
    <div aria-busy="true" aria-label="Loading…" className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className={`animate-shimmer rounded ${height} ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/** A full-page skeleton for route-level loading. */
export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading page…">
      <Skeleton block height="h-8" className="w-64" />
      <Skeleton block height="h-4" className="w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-line rounded-md p-4 space-y-3">
            <Skeleton block height="h-5" className="w-3/4" />
            <Skeleton lines={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
