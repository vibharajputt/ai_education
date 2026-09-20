import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const experimentsConfig: ModuleConfig = {
  id: 'experiments',
  title: 'CBSE Class 10 Virtual Science Experiments',
  track: 'school',
  classLevels: ['10'],
  icon: 'FlaskConical',
  tier: 'B',
  scopeLabel: '8 CBSE Class 10 Experiments with PhET Simulations & Persistent Observation Tables',
  dataSource: 'experiments.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.ExperimentsModule,
    }))
  ),
  searchable: true,
  description:
    '8 CBSE Class 10 Science experiments featuring embedded PhET simulations, step-by-step procedures, persistent observation tables, results, and precautions.',
};
