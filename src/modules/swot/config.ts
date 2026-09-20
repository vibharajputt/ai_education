// src/modules/swot/config.ts
import React from 'react';
import type { ModuleConfig } from '@core/registry';

export const swotConfig: ModuleConfig = {
  id: 'swot',
  title: 'SWOT Analysis & Diagnostic Profile',
  track: 'both',
  classLevels: ['9', '10', '11', '12'],
  icon: 'Compass',
  tier: 'B',
  scopeLabel: 'Strengths, Weaknesses, Opportunities & Threats Profile Matrix',
  dataSource: 'profile_summaries.json',
  view: React.lazy(() =>
    import('./index').then((m) => ({
      default: m.SwotModule,
    }))
  ),
  searchable: true,
  description:
    'Deterministic Strengths, Weaknesses, Opportunities, and Threats matrix matching pre-generated profile narratives without live runtime AI calls.',
};
