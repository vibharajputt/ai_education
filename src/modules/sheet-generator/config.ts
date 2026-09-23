// src/modules/sheet-generator/config.ts
import React from 'react';
import type { ModuleConfig } from '@core';

export const sheetGeneratorConfig: ModuleConfig = {
  id: 'sheet-generator',
  title: 'Worksheet & Test Generator',
  track: 'both',
  classLevels: ['10', '11', '12'],
  icon: 'Printer',
  tier: 'B',
  scopeLabel: 'Printable A4 Mock Question Sheets',
  dataSource: 'pyq/class10.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({ default: m.SheetGeneratorModule })),
  ),
  searchable: true,
  description:
    'Custom question set generator with multi-chapter coverage, A4 printable styling, and detached solution keys.',
};
