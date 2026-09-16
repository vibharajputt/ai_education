import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const demoCollegeConfig: ModuleConfig = {
  id: 'demo-college',
  title: 'Demo Interview Prep',
  track: 'college',
  classLevels: [],
  icon: 'GraduationCap',
  tier: 'C',
  scopeLabel: '5 sample interview questions across CS & Management',
  dataSource: 'demo-college.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.DemoCollegeModule,
    }))
  ),
  searchable: true,
  description:
    'Throwaway demo module proving the college-track engine end-to-end. Delete in Task 2.',
};
