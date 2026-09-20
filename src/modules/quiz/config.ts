// src/modules/quiz/config.ts
import React from 'react';
import type { ModuleConfig } from '@core';

export const quizConfig: ModuleConfig = {
  id: 'quiz',
  title: 'Adaptive Practice Quiz',
  track: 'both',
  classLevels: ['10', '11', '12'],
  icon: 'Zap',
  tier: 'B',
  scopeLabel: 'Timed Adaptive Practice Quizzes (10q / 25q / 50q) with Instant Elo Mastery & Full Worked Solutions',
  dataSource: 'question-bank.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({ default: m.QuizModule })),
  ),
  searchable: true,
  description:
    'Daily (10q), Weekly (25q), and Monthly (50q) timed quizzes that feed live Elo mastery ratings into your progress store.',
};
