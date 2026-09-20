import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const syllabusPlanConfig: ModuleConfig = {
  id: 'syllabus-plan',
  title: 'Syllabus Parser & Adaptive Study Plan',
  track: 'both',
  classLevels: ['10', '11', '12'],
  icon: 'Calendar',
  tier: 'B',
  scopeLabel: 'AI Syllabus Parser & Day-Wise Adaptive Study Plan',
  dataSource: 'study-planner.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.SyllabusPlanModule,
    }))
  ),
  searchable: true,
  description:
    'Parses uploaded syllabi into structured curriculum units and generates a day-wise adaptive study calendar with strict time constraints.',
};
