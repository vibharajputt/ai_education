import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const pyqAnalyzerConfig: ModuleConfig = {
  id: 'pyq-analyzer',
  title: 'PYQ Chapter & Concept Heatmap',
  track: 'school',
  classLevels: ['10'],
  icon: 'BarChart3',
  tier: 'A',
  scopeLabel: 'Class 10 Science + Maths, 2015-2024, 812 questions',
  dataSource: 'pyq-10th.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.PyqAnalyzerModule,
    }))
  ),
  searchable: true,
  description:
    '10-year trend analysis, repeat concept ranking, difficulty breakdown, and question browser across Class 10 Board Exams.',
};
