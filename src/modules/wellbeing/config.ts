import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const wellbeingConfig: ModuleConfig = {
  id: 'wellbeing',
  title: 'Exam Wellbeing & Relaxation Hub',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'Heart',
  tier: 'C',
  scopeLabel: 'Study-Skills & Relaxation Tools — Zero-AI, Non-Medical Exam Stress Support',
  dataSource: 'wellbeing.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.WellbeingModule,
    }))
  ),
  searchable: true,
  description:
    'Zero-AI study relaxation tools featuring drift-free animated breathing timers (4-7-8 and box breathing), 6 exam-anxiety cards, a gentle Pomodoro study-break scheduler, and explicit non-medical disclaimer.',
};
