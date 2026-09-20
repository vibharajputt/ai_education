// src/modules/progress-report/index.tsx
import React, { useMemo, useCallback } from 'react';
import {
  useCollection,
  useProgressStore,
  getAccuracyTrend,
  getTimeTrend,
  getDueItems,
  recordBatchAttempts,
} from '@core';
import { StateShell } from '@components/StateShell';
import { MasteryHeatStrip } from './components/MasteryHeatStrip';
import { TrendCharts } from './components/TrendCharts';
import { StreakCard } from './components/StreakCard';
import { DueRevisionQueue } from './components/DueRevisionQueue';
import { EmptyProgressState } from './components/EmptyProgressState';
import { useNavigate } from 'react-router-dom';

export function ProgressReportModule() {
  const { collection, items: rawItems, loading, error, reload } = useCollection('question-bank.json');
  const store = useProgressStore();
  const navigate = useNavigate();

  const conceptsList = useMemo(() => {
    return Object.values(store.conceptMasteries);
  }, [store.conceptMasteries]);

  const accuracyTrend = useMemo(() => getAccuracyTrend(5), [store.attempts]);
  const timeTrend = useMemo(() => getTimeTrend(5), [store.attempts]);

  const dueItems = useMemo(() => {
    return getDueItems(rawItems, 15);
  }, [rawItems, store.itemReviews]);

  const handleSeedDemo = useCallback(() => {
    const demoAttempts = [
      {
        itemId: 'qb-phy-11-001',
        correct: true,
        timeTaken: 42,
        timestamp: Date.now() - 86400000 * 3,
        sourceModule: 'quiz',
        difficulty: 'medium' as const,
        concepts: ['Kinematics', 'Projectile Motion'],
      },
      {
        itemId: 'qb-phy-11-002',
        correct: true,
        timeTaken: 38,
        timestamp: Date.now() - 86400000 * 3,
        sourceModule: 'quiz',
        difficulty: 'easy' as const,
        concepts: ["Newton's Laws", 'Friction'],
      },
      {
        itemId: 'qb-chem-12-001',
        correct: false,
        timeTaken: 85,
        timestamp: Date.now() - 86400000 * 2,
        sourceModule: 'quiz',
        difficulty: 'hard' as const,
        concepts: ['Electrochemistry', 'Nernst Equation'],
      },
      {
        itemId: 'qb-math-12-001',
        correct: true,
        timeTaken: 55,
        timestamp: Date.now() - 86400000 * 1,
        sourceModule: 'quiz',
        difficulty: 'medium' as const,
        concepts: ['Definite Integrals', 'Calculus'],
      },
      {
        itemId: 'qb-math-12-002',
        correct: true,
        timeTaken: 35,
        timestamp: Date.now() - 86400000 * 1,
        sourceModule: 'quiz',
        difficulty: 'easy' as const,
        concepts: ['Matrices & Determinants'],
      },
      {
        itemId: 'qb-phy-12-001',
        correct: false,
        timeTaken: 90,
        timestamp: Date.now(),
        sourceModule: 'quiz',
        difficulty: 'hard' as const,
        concepts: ['Electromagnetic Induction', 'Faraday Law'],
      },
      {
        itemId: 'qb-chem-11-001',
        correct: true,
        timeTaken: 30,
        timestamp: Date.now(),
        sourceModule: 'quiz',
        difficulty: 'easy' as const,
        concepts: ['Chemical Bonding', 'VSEPR Theory'],
      },
    ];

    recordBatchAttempts(demoAttempts);
  }, []);

  const handleLaunchPractice = useCallback(() => {
    navigate('/school/quiz');
  }, [navigate]);

  if (loading) {
    return <StateShell state="loading" title="Loading Mastery Data..." message="Aggregating performance metrics." />;
  }

  if (error) {
    return (
      <StateShell
        state="error"
        title="Failed to Load Content Base"
        message={error.message}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Scope Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
          {collection?.scopeLabel || 'Deterministic Progress Analytics'}
        </span>
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
          Progress & Mastery Matrix
        </h1>
      </div>

      {store.attempts.length === 0 ? (
        <EmptyProgressState onSeedDemo={handleSeedDemo} />
      ) : (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <StreakCard stats={store.userStats} onReset={store.resetProgressStore} />

          {/* Heat Strip */}
          <MasteryHeatStrip concepts={conceptsList} />

          {/* Trends */}
          <TrendCharts accuracyTrend={accuracyTrend} timeTrend={timeTrend} />

          {/* Due Revision Queue */}
          <DueRevisionQueue dueItems={dueItems} onLaunchPractice={handleLaunchPractice} />
        </div>
      )}
    </div>
  );
}
