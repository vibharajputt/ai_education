// src/modules/interview-prep/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const interviewPrepConfig: ModuleConfig = {
  id: 'interview-prep',
  title: 'Tech & HR Interview Simulator',
  track: 'college',
  classLevels: [],
  icon: 'GraduationCap',
  tier: 'A',
  scopeLabel: 'Role-Based Assessment, Section Quizzes & SWOT Matrix Feedback',
  dataSource: 'interview-prep.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.InterviewPrepModule,
    }))
  ),
  searchable: true,
  description:
    'Simulate full Technical, Scenario Architecture, and HR STAR interview rounds tailored to your target job role with instant SWOT diagnosis.',
};
