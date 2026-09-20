import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findModule } from '@core/registry';
import { ErrorState } from '@components/ErrorState';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import { DynamicIcon } from '@components/DynamicIcon';
import { ChevronLeft, Info } from 'lucide-react';

export function ModuleHost() {
  const { track, moduleId } = useParams<{ track: string; moduleId: string }>();

  if (!moduleId) {
    return (
      <div className="p-8">
        <ErrorState
          title="Invalid Module Route"
          detail="No module identifier was provided in the URL."
        />
      </div>
    );
  }

  const moduleConfig = findModule(moduleId);

  if (!moduleConfig) {
    return (
      <div className="p-8">
        <ErrorState
          title="Module Not Found"
          detail={`The module "${moduleId}" does not exist in the platform registry.`}
        />
      </div>
    );
  }

  React.useEffect(() => {
    if (moduleConfig) {
      try {
        localStorage.setItem(
          'ai_edu_last_visited_module',
          JSON.stringify({
            track: track || 'school',
            id: moduleConfig.id,
            title: moduleConfig.title,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // ignore storage quota errors
      }
    }
  }, [moduleConfig, track]);

  const ViewComponent = moduleConfig.view;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Standardized Module Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              aria-label="Back to overview"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)] shrink-0">
                <DynamicIcon name={moduleConfig.icon} className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)] leading-none">
                    {moduleConfig.title}
                  </h1>
                  <Badge label={moduleConfig.tier} variant="tier" />
                  <Badge label={moduleConfig.track} variant="track" />
                </div>
                {moduleConfig.classLevels && moduleConfig.classLevels.length > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Target: Class {moduleConfig.classLevels.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Explicit Scope Badge / Callout (Mandatory per AGENTS.md rule) */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)]">
            <Info className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span className="font-medium">
              Scope: <span className="font-semibold text-[var(--color-text)]">{moduleConfig.scopeLabel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Module Content View */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <Suspense fallback={<StateShell status="loading" />}>
          <ViewComponent />
        </Suspense>
      </div>
    </div>
  );
}
