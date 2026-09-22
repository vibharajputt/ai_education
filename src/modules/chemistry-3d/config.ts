import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const chemistry3dConfig: ModuleConfig = {
  id: 'chemistry-3d',
  title: '3D Molecule Viewer & Mechanisms',
  track: 'school',
  classLevels: ['11', '12'],
  icon: 'Atom',
  tier: 'B',
  scopeLabel: '15 molecules + 4 organic mechanisms — Class 11–12 Chemistry',
  dataSource: 'chemistry-3d.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({ default: m.Chemistry3DModule }))
  ),
  searchable: false,
  description:
    'Rotate real 3D molecular structures and step through organic reaction mechanisms with electron-movement annotations.',
};
