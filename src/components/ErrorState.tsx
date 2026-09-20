import { AlertCircle } from 'lucide-react';
import type { LoaderError } from '@core/loaders';

interface ErrorStateProps {
  title?: string;
  detail?: string;
  message?: string;
  error?: Error | LoaderError | null;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  detail,
  message: msgProp,
  error,
  retry,
  className = '',
}: ErrorStateProps) {
  const message = detail ?? msgProp ?? error?.message ?? 'An unexpected error occurred.';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-danger-tint flex items-center justify-center mb-4">
        <AlertCircle className="w-5 h-5 text-danger" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted max-w-sm font-mono break-all">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 px-4 py-2 text-sm font-medium border border-line rounded hover:bg-surface-raised transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
