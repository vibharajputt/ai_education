import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const dailyTasksConfig: ModuleConfig = {
  id: 'daily-tasks',
  title: 'Adaptive Daily Practice Plan',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'CheckSquare',
  tier: 'B',
  scopeLabel: 'Structured Daily Task Checklist & Adaptive Elo Practice',
  dataSource: 'daily-tasks.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.DailyTasksModule,
    }))
  ),
  searchable: true,
  description:
    'Daily task checklist with streak tracking, adaptive difficulty scaling, and progress integration.',
};
