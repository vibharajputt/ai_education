// src/modules/weak-topics/config.ts
import React from 'react';
import type { ModuleConfig } from '@core';

export const swotConfig: ModuleConfig = {
  id: 'weak-topics',
  title: 'SWOT & Weak Area Diagnosis',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'Target',
  tier: 'B',
  scopeLabel: 'Targeted Weakness Overhaul Plan',
  dataSource: 'weak-topics.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({ default: m.WeakTopicsModule })),
  ),
  searchable: true,
  description:
    'Comprehensive diagnostic audit categorizing performance into Strengths, Weaknesses, Opportunities, and Threats with tailored remedial roadmaps.',
};
