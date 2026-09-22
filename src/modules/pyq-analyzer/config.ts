import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const pyqAnalyzerConfig: ModuleConfig = {
  id: 'pyq-analyzer',
  title: 'PYQ Forensic Analyzer',
  track: 'school',
  classLevels: ['10'],
  icon: 'TrendingUp',
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
    '10-year forensic CBSE Class 10 chapter & concept frequency analysis, marks heatmaps, and pattern repeat rankings.',
};
