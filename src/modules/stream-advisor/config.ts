import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const streamAdvisorConfig: ModuleConfig = {
  id: 'stream-advisor',
  title: 'Class 10 Stream Selection Advisor',
  track: 'school',
  classLevels: ['10'],
  icon: 'Compass',
  tier: 'B',
  scopeLabel: '15-Question Aptitude & Interest Assessment — Class 10 Stream Selection',
  dataSource: 'stream-advisor.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.StreamAdvisorModule,
    }))
  ),
  searchable: true,
  description:
    '15-question psychometric instrument for Class 10 stream selection. Features 100% deterministic TypeScript scoring rubric, confidence bands, driving answer reasoning, and retake comparison.',
};
