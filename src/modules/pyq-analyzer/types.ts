import { ContentItem } from '@core/types';

export type ViewTab = 'heatmap' | 'repeat' | 'difficulty' | 'browser';

export interface ChapterHeatmapRow {
  chapter: string;
  subject: string;
  yearMarks: Record<number, number>; // year -> total marks
  yearCounts: Record<number, number>; // year -> question count
  totalMarks: number;
  totalCount: number;
  trend: 'up' | 'flat' | 'down';
  trendRatio: number;
}

export interface ConceptRepeatItem {
  concept: string;
  subject: string;
  chapter: string;
  yearsAppeared: number[];
  appearanceCount: number;
  totalMarks: number;
  avgMarks: number;
  repeatScore: number;
  siblingQuestions: ContentItem[];
}

export interface ChapterStats {
  chapter: string;
  subject: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  conceptualCount: number;
  numericalCount: number;
  diagramCount: number;
  applicationCount: number;
  totalQuestions: number;
}
