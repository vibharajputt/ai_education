import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const mnemonicsConfig: ModuleConfig = {
  id: 'mnemonics',
  title: 'Formula & Concept Mnemonics Vault',
  track: 'school',
  classLevels: ['9', '10', '11', '12'],
  icon: 'Zap',
  tier: 'B',
  scopeLabel: '60 Curated Mnemonics across Chemistry, Physics, Math, Biology & History',
  dataSource: 'mnemonics.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.MnemonicsModule,
    }))
  ),
  searchable: true,
  description:
    '60 curated mnemonics covering Periodic Table Groups, Reactivity Series, History Eras, Biological Classification, and Trigonometry with filters, custom generator, and practice mode.',
};
