import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const entranceTracksConfig: ModuleConfig = {
  id: 'entrance-tracks',
  title: 'Entrance Exam Track Catalog',
  track: 'both',
  classLevels: ['11', '12'],
  icon: 'Target',
  tier: 'C',
  scopeLabel: '100 PYQs & Syllabus Maps across JEE, NEET, CLAT, CA Foundation',
  dataSource: 'entrance-tracks.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.EntranceTracksModule,
    }))
  ),
  searchable: true,
  description:
    'Syllabus tree maps, 25 PYQs per exam with solutions, and PYQ weightage heatmaps for JEE, NEET, CLAT, and CA Foundation.',
};
