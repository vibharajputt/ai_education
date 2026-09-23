import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const resumeAnalyzerConfig: ModuleConfig = {
  id: 'resume-analyzer',
  title: 'AI Resume & ATS Optimizer',
  track: 'college',
  classLevels: [],
  icon: 'FileCheck2',
  tier: 'A',
  scopeLabel: 'ATS Scoring & Line-by-Line Rewrites',
  dataSource: 'resume-analyzer.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.ResumeAnalyzerModule,
    }))
  ),
  searchable: true,
  description:
    'Forensic resume evaluation with non-generic line citations, 5-factor ATS scoring, bullet rewrites, and JD skill-gap mapping.',
};
