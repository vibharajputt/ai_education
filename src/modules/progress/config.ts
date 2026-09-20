// src/modules/progress/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const progressConfig: ModuleConfig = {
  id: 'progress',
  title: 'Progress & Mastery Dashboard',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'TrendingUp',
  tier: 'B',
  scopeLabel: 'Elo Concept Heat Strips, Accuracy & Time Trends, FSRS Revision Queue',
  dataSource: 'pyq-10th.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.ProgressModule,
    }))
  ),
  searchable: true,
  description:
    'Deterministic analytics dashboard featuring Elo concept heat strips, accuracy trends, speed metrics, streak counters, and FSRS spaced repetition queue.',
};
