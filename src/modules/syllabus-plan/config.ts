import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const syllabusPlanConfig: ModuleConfig = {
  id: 'syllabus-plan',
  title: 'AI Adaptive Study Planner',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'Calendar',
  tier: 'B',
  scopeLabel: 'Day-Wise Board Exam Roadmap & Targets',
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
