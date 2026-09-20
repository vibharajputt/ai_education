import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const mockInterviewConfig: ModuleConfig = {
  id: 'mock-interview',
  title: 'AI Mock Technical & Behavioral Interview Coach',
  track: 'college',
  classLevels: [],
  icon: 'Mic',
  tier: 'C',
  scopeLabel: '5-Question SDE Technical & Behavioral Practice Interview',
  dataSource: 'mock-interview.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.MockInterviewModule,
    }))
  ),
  searchable: true,
  description:
    '5-Question SDE practice interview with MediaRecorder audio capture, per-answer rubric feedback, filler-word counter, and exportable transcript report.',
};
