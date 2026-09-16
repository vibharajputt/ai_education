import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const demoSchoolConfig: ModuleConfig = {
  id: 'demo-school',
  title: 'Demo Questions',
  track: 'school',
  classLevels: ['11', '12'],
  icon: 'BookOpen',
  tier: 'C',
  scopeLabel: '5 sample questions across Physics & Chemistry — Class 11–12',
  dataSource: 'demo-school.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.DemoSchoolModule,
    }))
  ),
  searchable: true,
  description:
    'Throwaway demo module proving the school-track engine end-to-end. Delete in Task 2.',
};
