import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const conceptVideosConfig: ModuleConfig = {
  id: 'concept-videos',
  title: '3D Animated Concept Video Lessons',
  track: 'school',
  classLevels: ['9', '10', '11', '12'],
  icon: 'Video',
  tier: 'B',
  scopeLabel: '6 pre-rendered animated video lessons across Class 10 STEM — Dual Audio (EN/HI)',
  dataSource: 'concept-videos.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.ConceptVideosModule,
    }))
  ),
  searchable: true,
  description:
    '6 3D animated STEM video lessons with dual English & Hindi audio, synced interactive transcript seeking, chapter markers, and Manim rendering pipeline manifest.',
};
