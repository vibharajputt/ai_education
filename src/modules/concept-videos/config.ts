import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const conceptVideosConfig: ModuleConfig = {
  id: 'concept-videos',
  title: 'Concept Explainer Videos',
  track: 'school',
  classLevels: ['10', '11', '12'],
  icon: 'Video',
  tier: 'B',
  scopeLabel: '6 animated concept explainers — Maths & Science, Hindi + English',
  dataSource: '',
  view: React.lazy(() =>
    import('./index').then((m) => ({ default: m.ConceptVideosModule }))
  ),
  searchable: false,
  description:
    'Manim-generated animated explainers with Hindi + English narration, built from the Manim → IndicF5 TTS → WhisperX → FFmpeg pipeline.',
};
