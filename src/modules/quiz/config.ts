// src/modules/quiz/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const quizConfig: ModuleConfig = {
  id: 'quiz',
  title: 'Interactive Adaptive Practice Quiz',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'HelpCircle',
  tier: 'B',
  scopeLabel: 'Daily (10q), Weekly (25q), Monthly (50q) & Custom Timed Quizzes',
  dataSource: 'pyq-10th.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.QuizModule,
    }))
  ),
  searchable: true,
  description:
    'Timed adaptive practice quiz feeding attempts into real-time progress store, Elo ratings, and FSRS spaced repetition queue.',
};
