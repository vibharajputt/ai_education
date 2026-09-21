import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const pyqAnalyzerConfig: ModuleConfig = {
  id: 'pyq-analyzer',
  title: '10-Yr PYQ Forensic Analyzer',
  track: 'school',
  classLevels: ['9', '10', '11', '12'],
  icon: 'TrendingUp',
  tier: 'A',
  scopeLabel: '2015–2024 Exam Frequency & Heatmaps',
  dataSource: 'pyq-analyzer.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.PyqAnalyzerModule,
    }))
  ),
  searchable: true,
  description:
    '10-year forensic CBSE Class 10 chapter & concept frequency analysis, marks heatmaps, and pattern repeat rankings.',
};
