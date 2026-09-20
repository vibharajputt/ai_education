// src/modules/weak-topics/index.tsx
import React, { useMemo } from 'react';
import { useCollection, useProgressStore, getSwotStatistics } from '@core';
import { StateShell } from '@components/StateShell';
import { SwotMatrix } from './components/SwotMatrix';
import { NarrativeReport } from './components/NarrativeReport';
import { ActionPlan } from './components/ActionPlan';
import { getNarrativeProfile } from './services/narratives';
import { Target, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WeakTopicsModule() {
  const { collection, loading, error, reload } = useCollection('weak-topics.json');
  const store = useProgressStore();

  const swotStats = useMemo(() => {
    return getSwotStatistics();
  }, [store.attempts, store.conceptMasteries]);

  const profile = useMemo(() => {
    return getNarrativeProfile(swotStats.statProfileKey);
  }, [swotStats.statProfileKey]);

  if (loading) {
    return <StateShell state="loading" title="Analyzing Performance Matrix..." message="Evaluating strengths and decay factors." />;
  }

  if (error) {
    return (
      <StateShell
        state="error"
        title="Failed to Load Diagnostic Models"
        message={error.message}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
            {collection?.scopeLabel || 'Diagnostic SWOT & Weakness Detector'}
          </span>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
            SWOT Diagnostic Matrix
          </h1>
        </div>

        {store.attempts.length === 0 && (
          <Link
            to="/school/quiz"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-xs hover:opacity-90"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Take Diagnostic Quiz
          </Link>
        )}
      </div>

      {/* 4-Quadrant SWOT Matrix */}
      <SwotMatrix stats={swotStats} />

      {/* Pre-generated Narrative Report */}
      <NarrativeReport profile={profile} />

      {/* 3-Day Remedial Action Plan */}
      <ActionPlan weaknesses={swotStats.weaknesses} threats={swotStats.threats} />
    </div>
  );
}
