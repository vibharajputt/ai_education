import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const vivaConfig: ModuleConfig = {
  id: 'viva',
  title: 'Practical Viva Voce Practice & Quiz Coach',
  track: 'school',
  classLevels: ['10'],
  icon: 'HelpCircle',
  tier: 'B',
  scopeLabel: '96 Practical Viva Questions across 8 CBSE Science Experiments — Class 10',
  dataSource: 'viva.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.VivaModule,
    }))
  ),
  searchable: true,
  description:
    'Exemplar practical viva question bank per experiment with model answers, examiner tips, difficulty filters, and interactive self-scored "Quiz Me" mode.',
};
