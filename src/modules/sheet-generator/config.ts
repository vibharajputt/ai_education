// src/modules/sheet-generator/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const sheetGeneratorConfig: ModuleConfig = {
  id: 'sheet-generator',
  title: 'Worksheet & Practice Paper Generator',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'FileText',
  tier: 'B',
  scopeLabel: 'Custom Chapter Mix, Printable A4 Worksheets, Coverage Report & Answer Keys',
  dataSource: 'pyq-10th.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.SheetGeneratorModule,
    }))
  ),
  searchable: true,
  description:
    'Generate customized, printable A4 practice worksheets with chapter coverage reports, difficulty mixes, and separate answer key pages.',
};
