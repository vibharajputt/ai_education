// src/modules/progress-report/config.ts
import React from 'react';
import type { ModuleConfig } from '@core';

export const progressReportConfig: ModuleConfig = {
  id: 'progress-report',
  title: 'Progress & Mastery Matrix',
  track: 'both',
  classLevels: ['10', '11', '12'],
  icon: 'TrendingUp',
  tier: 'B',
  scopeLabel: 'Deterministic Spaced-Repetition Analytics, Elo Mastery Heatmap & FSRS Review Queue',
  dataSource: 'question-bank.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({ default: m.ProgressReportModule })),
  ),
  searchable: true,
  description:
    'Real-time Elo concept proficiency heatmap, accuracy & speed velocity trajectories, daily study streaks, and FSRS spaced repetition review queue.',
};
