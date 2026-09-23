import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const splitViewConfig: ModuleConfig = {
  id: 'split-view',
  title: 'CBSE Board Sample Papers',
  track: 'school',
  classLevels: ['10', '12'],
  icon: 'Columns',
  tier: 'A',
  scopeLabel: 'Official Class 10 & 12 Papers + AI Step Solutions',
  dataSource: 'pyq-10th.json',
  view: React.lazy(() =>
    import('./index.tsx').then((m) => ({
      default: m.SplitViewModule,
    }))
  ),
  searchable: true,
  description:
    'Subject-wise CBSE Class 10 & 12 Official Sample Question Papers (SQP) from cbseacademic.nic.in with half-screen verified step marking solutions.',
};
