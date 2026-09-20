// src/modules/quiz/types.ts
import type { ContentItem, Difficulty } from '@core';

export type QuizMode = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface QuizQuestion {
  item: ContentItem;
  selectedOptionIndex?: number;
  selectedAnswerText?: string;
  isCorrect?: boolean;
  timeTakenSec: number;
  flaggedForReview: boolean;
}

export interface QuizConfigState {
  mode: QuizMode;
  questionCount: number;
  timeLimitSec: number;
  selectedChapters: string[];
  difficulties: Difficulty[];
}

export interface QuizSessionSummary {
  mode: QuizMode;
  totalQuestions: number;
  correctCount: number;
  accuracyPercent: number;
  totalTimeSec: number;
  avgTimePerQuestionSec: number;
  conceptChanges: Array<{
    concept: string;
    oldRating: number;
    newRating: number;
    delta: number;
    masteryPercent: number;
  }>;
  questions: QuizQuestion[];
  completedAt: number;
}
