// src/app/ModuleHost.tsx
import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findModule } from '@core/registry';
import { ErrorState } from '@components/ErrorState';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import { DynamicIcon } from '@components/DynamicIcon';
import { ChevronLeft, Info, Sparkles } from 'lucide-react';

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

  const ViewComponent = moduleConfig.view;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Standardized Attractive Module Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shrink-0"
              aria-label="Back to dashboard"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 shrink-0">
                <DynamicIcon name={moduleConfig.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-[var(--color-text)] leading-snug tracking-tight truncate">
                    {moduleConfig.title}
                  </h1>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    TIER {moduleConfig.tier}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                    {moduleConfig.track === 'both' ? 'School & College' : `${moduleConfig.track} Track`}
                  </span>
                </div>
                {moduleConfig.classLevels && moduleConfig.classLevels.length > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5 flex items-center gap-1.5">
                    <span>Target:</span>
                    <span className="font-bold text-[var(--color-text)]">
                      Class {moduleConfig.classLevels.join(', ')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Explicit Scope Badge / Callout (Mandatory per AGENTS.md rule) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/20 text-xs text-[var(--color-text)] shrink-0 self-start md:self-auto">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="text-xs">
              <span className="text-[var(--color-text-muted)] font-medium">Scope: </span>
              <span className="font-bold text-[var(--color-text)]">{moduleConfig.scopeLabel}</span>
            </div>
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
