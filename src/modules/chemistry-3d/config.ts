import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const chemistry3dConfig: ModuleConfig = {
  id: 'chemistry-3d',
  title: '3D Molecular Structures & Reaction Mechanisms',
  track: 'school',
  classLevels: ['11', '12'],
  icon: 'Atom',
  tier: 'B',
  scopeLabel: '15 3D Molecules, 4 Stepped Organic Mechanisms, 20 Reaction Exceptions — CBSE Class 11-12',
  dataSource: 'chemistry-3d.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.Chemistry3DModule,
    }))
  ),
  searchable: true,
  description:
    'Interactive 3Dmol.js molecular visualization with style & label toggles, WebGL fallback, 4 stepped organic reaction mechanisms, and 20 reaction exception rules.',
};
