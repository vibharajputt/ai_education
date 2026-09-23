// src/modules/career-path/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const careerPathConfig: ModuleConfig = {
  id: 'career-path',
  title: 'Career Pathways',
  track: 'college',
  classLevels: [],
  icon: 'Compass',
  tier: 'B',
  scopeLabel: 'Personalized Domain, Branch & Choice Roadmaps',
  dataSource: 'career-path.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.CareerPathModule,
    }))
  ),
  searchable: true,
  description:
    'Generate personalized milestone roadmaps, tech stacks, capstone project ideas, and salary benchmarks tailored to your domain, branch, and career goals.',
};
