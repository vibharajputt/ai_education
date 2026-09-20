import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const interviewPrepConfig: ModuleConfig = {
  id: 'interview-prep',
  title: 'Tech & Industry Interview Question Bank',
  track: 'college',
  classLevels: [],
  icon: 'Briefcase',
  tier: 'B',
  scopeLabel: '120 Role-Specific & STAR Behavioral Questions for SDE, Data & Analyst',
  dataSource: 'interview-prep.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.InterviewPrepModule,
    }))
  ),
  searchable: true,
  description:
    'Role-wise question banks for SDE, Data, and Analyst roles with STAR behavioural framework, model answers, and resume-based question generation.',
};
