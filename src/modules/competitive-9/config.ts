import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const competitive9Config: ModuleConfig = {
  id: 'competitive-9',
  title: 'Class 9 Competitive Exam Prep',
  track: 'school',
  classLevels: ['9'],
  icon: 'Trophy',
  tier: 'C',
  scopeLabel: '160 questions across 4 exams — Class 9',
  dataSource: 'competitive-9.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.Competitive9Module,
    }))
  ),
  searchable: true,
  description:
    '160 questions across NTSE, NSO, IMO, and IEO exams with worked solutions, difficulty tags, and chapter filters.',
};
