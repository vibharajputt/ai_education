import type { ContentItem } from '@core/types';

export interface ChapterHeatmapRow {
  chapter: string;
  subject: string;
  yearMarks: Record<number, number>;
  yearCounts: Record<number, number>;
  totalMarks: number;
  totalQuestions: number;
  trend: 'up' | 'down' | 'steady';
  avgMarksRecent: number;
  avgMarksPast: number;
}

export interface ConceptRanking {
  concept: string;
  subject: string;
  chapter: string;
  appearedYears: number[];
  distinctYearsCount: number;
  avgMarks: number;
  totalQuestions: number;
  repeatScore: number;
  questions: ContentItem[];
}

export interface ChapterDifficultyDist {
  chapter: string;
  subject: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
}

export interface ChapterTypeDist {
  chapter: string;
  subject: string;
  total: number;
  conceptual: number;
  numerical: number;
  diagram: number;
  application: number;
  conceptualPct: number;
  numericalPct: number;
  diagramPct: number;
  applicationPct: number;
}

export function getItemYear(item: ContentItem): number | undefined {
  if (item.kind === 'question') return item.year;
  return (item.metadata?.year as number) ?? undefined;
}

export function getItemMarks(item: ContentItem): number | undefined {
  if (item.kind === 'question') return item.marks;
  return (item.metadata?.marks as number) ?? undefined;
}

