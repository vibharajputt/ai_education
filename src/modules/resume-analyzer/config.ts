// src/modules/resume-analyzer/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const resumeAnalyzerConfig: ModuleConfig = {
  id: 'resume-analyzer',
  title: 'AI Resume & ATS Analyzer',
  track: 'college',
  classLevels: [],
  icon: 'FileCheck',
  tier: 'A',
  scopeLabel: 'ATS Score, Line-by-Line Findings, Rewrites & JD Gap Analysis',
  dataSource: 'artifact_analyses.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.ResumeAnalyzerModule,
    }))
  ),
  searchable: true,
  description:
    'Live AI-augmented resume parser & ATS optimizer with line-by-line quoted findings, bullet point diff rewrites, and target job description gap analysis.',
};
