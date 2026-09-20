import type { ContentItem, Explanation, ExplanationStep, MarkingBreakdown } from '@core/types';

export interface DiagramGuidance {
  required: boolean;
  title?: string;
  description: string;
  labelsToInclude: string[];
  placeholderFigure?: string;
}

export interface VerifiedExplanationExtended extends Explanation {
  modelAnswer: string;
  requiredKeywords: string[];
  diagramGuidance?: DiagramGuidance;
  examinerPerspective: string;
  repeatYearsCount?: number;
  siblingQuestions?: ContentItem[];
}

export interface SplitViewPreference {
  dividerRatio: number;
  scrollSync: boolean;
  highlightKeywords: boolean;
}
