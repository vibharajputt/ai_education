// src/modules/weak-topics/types.ts
import type { ConceptMastery, SwotStats } from '@core';

export interface SwotNarrativeProfile {
  key: SwotStats['statProfileKey'];
  title: string;
  badge: string;
  summary: string;
  strengthsNarrative: string;
  weaknessesNarrative: string;
  opportunitiesNarrative: string;
  threatsNarrative: string;
  studyStrategy: string[];
  recommendedDailyMinutes: number;
}

export interface RemedialAction {
  id: string;
  title: string;
  concept: string;
  priority: 'high' | 'medium' | 'low';
  actionType: 'worksheet' | 'quiz' | 'concept-map';
  description: string;
}
