import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const splitViewConfig: ModuleConfig = {
  id: 'split-view',
  title: 'Exam Paper Split-Screen',
  track: 'school',
  classLevels: ['10', '12'],
  icon: 'Columns',
  tier: 'A',
  scopeLabel: '40 Board Exam Questions with Verified Step Breakdown — Class 10/12',
  dataSource: 'pyq/class10.json',
  view: React.lazy(() =>
    import('./index.tsx').then((m) => ({
      default: m.SplitViewModule,
    }))
  ),
  searchable: true,
  description:
    'Full board examination question paper side-by-side with verified marking breakdowns, diagram directives, and examiner answer coach.',
};
