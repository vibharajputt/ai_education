// src/modules/progress-report/types.ts
import type { ConceptMastery, ItemReviewState } from '@core';

export type HeatFilter = 'all' | 'mastered' | 'learning' | 'struggling' | 'due';

export interface ProgressFilterState {
  heatFilter: HeatFilter;
  searchQuery: string;
  sortBy: 'mastery' | 'rating' | 'attempts' | 'due';
}
