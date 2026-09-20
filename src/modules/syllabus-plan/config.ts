// src/modules/syllabus-plan/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const syllabusPlanConfig: ModuleConfig = {
  id: 'syllabus-plan',
  title: 'Syllabus to Study Plan Generator',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'Calendar',
  tier: 'B',
  scopeLabel: 'Syllabus PDF Parsing, Deadline Scheduling, Day-wise Allocation & Re-planner',
  dataSource: 'study_plans.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.SyllabusPlanModule,
    }))
  ),
  searchable: true,
  description:
    'Upload a syllabus PDF or paste text to generate a day-wise study schedule. Features strictly capped hours/day, persistent checkboxes, dropped unit reasons, and deadline re-planner.',
};
