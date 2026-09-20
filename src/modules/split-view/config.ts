import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const splitViewConfig: ModuleConfig = {
  id: 'split-view',
  title: 'Split-Screen Paper & Answer Coach',
  track: 'school',
  classLevels: ['10', '11', '12'],
  icon: 'Split',
  tier: 'A',
  scopeLabel: '40 Questions across Class 10 STEM — CBSE Board Paper',
  dataSource: 'split-view-paper.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.SplitViewModule,
    }))
  ),
  searchable: true,
  description:
    'Product signature split-screen workspace with resizable divider, scroll sync, mark-wise Answer Coach, and keyboard shortcuts.',
};
