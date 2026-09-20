// src/modules/sheet-generator/types.ts
import type { Difficulty, QuestionType, ContentItem } from '@core';

export interface SheetConfig {
  title: string;
  institutionName: string;
  studentNameRequired: boolean;
  timeLimitMinutes: number;
  totalMarks: number;
  selectedChapters: string[];
  difficulties: Difficulty[];
  questionTypes: QuestionType[];
  questionCount: number;
  includeAnswerSpace: boolean;
  includeAnswerKey: boolean;
}

export interface CoverageReportData {
  totalPoolCount: number;
  selectedCount: number;
  coveredChapters: string[];
  allChapters: string[];
  coveragePercent: number;
  difficultyCounts: Record<Difficulty, number>;
  typeCounts: Record<string, number>;
  totalMarks: number;
}

export interface WorksheetData {
  config: SheetConfig;
  items: ContentItem[];
  coverage: CoverageReportData;
  generatedAt: number;
}
