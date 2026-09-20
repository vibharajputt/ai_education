// src/core/progress.ts
// Shared deterministic progress store backed by versioned localStorage.
// All derived metrics (Elo concept mastery, FSRS due queue, accuracy/speed trends)
// are computed purely in TypeScript without any runtime LLM calls.

import { useSyncExternalStore } from 'react';
import type { Difficulty, ContentItem } from './types';

export const CURRENT_SCHEMA_VERSION = 2;
const STORAGE_KEY = 'ai_edu_progress_store_v2';
const LEGACY_STORAGE_KEYS = ['ai_edu_progress_store', 'ai_edu_user_progress', 'progress_store'];
const STORE_CHANGE_EVENT = 'ai_edu_progress_change';

// ---------------------------------------------------------------------------
// Elo Configuration (Tunable Constants)
// ---------------------------------------------------------------------------
export const ELO_CONFIG = {
  INITIAL_RATING: 1200,
  K_FACTOR: 32,
  MIN_RATING: 600,
  MAX_RATING: 2000,
  DIFFICULTY_RATINGS: {
    easy: 1000,
    medium: 1200,
    hard: 1400,
  } as Record<Difficulty, number>,
};

// ---------------------------------------------------------------------------
// FSRS (Free Spaced Repetition Scheduler) Configuration
// ---------------------------------------------------------------------------
export const FSRS_CONFIG = {
  REQUESTED_RETENTION: 0.9,
  // Initial stability per grade: [Again(1), Hard(2), Good(3), Easy(4)] (in days)
  INITIAL_STABILITY: [0.4, 1.2, 3.0, 7.5],
  // Initial difficulty per grade
  INITIAL_DIFFICULTY: [7.0, 5.5, 4.0, 2.5],
};

// ---------------------------------------------------------------------------
// Data Types
// ---------------------------------------------------------------------------

export type FSRSGrade = 1 | 2 | 3 | 4; // 1: Again (failed), 2: Hard, 3: Good, 4: Easy

export interface AttemptRecord {
  id: string;
  itemId: string;
  correct: boolean;
  timeTaken: number; // in seconds
  timestamp: number; // epoch ms
  sourceModule: string;
  difficulty?: Difficulty;
  concepts: string[];
  selectedOption?: string;
  userNotes?: string;
}

export interface ItemReviewState {
  itemId: string;
  lastReviewed: number;
  dueTimestamp: number;
  stability: number; // in days
  difficulty: number; // 1 to 10
  reps: number;
  lapses: number;
}

export type MasteryStatus = 'mastered' | 'learning' | 'struggling' | 'unattempted';

export interface ConceptMastery {
  concept: string;
  rating: number; // Elo (600 - 2000)
  masteryPercent: number; // 0 - 100
  attemptsCount: number;
  correctCount: number;
  lastAttempted: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses?: number;
  dueTimestamp: number;
  status: MasteryStatus;
}

export interface UserStats {
  totalAttempts: number;
  totalCorrect: number;
  accuracyPercent: number;
  totalTimeSeconds: number;
  avgTimePerQuestion: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activityHistory: Record<string, number>; // date string -> count of attempts
}

export interface ProgressStoreState {
  version: number;
  attempts: AttemptRecord[];
  conceptMasteries: Record<string, ConceptMastery>;
  itemReviews: Record<string, ItemReviewState>;
  userStats: UserStats;
}

// ---------------------------------------------------------------------------
// Default Initial State (Clean First-Run)
// ---------------------------------------------------------------------------

export function getInitialState(): ProgressStoreState {
  return {
    version: CURRENT_SCHEMA_VERSION,
    attempts: [],
    conceptMasteries: {},
    itemReviews: {},
    userStats: {
      totalAttempts: 0,
      totalCorrect: 0,
      accuracyPercent: 0,
      totalTimeSeconds: 0,
      avgTimePerQuestion: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      activityHistory: {},
    },
  };
}

// ---------------------------------------------------------------------------
// Deterministic Calculations (Elo & FSRS)
// ---------------------------------------------------------------------------

/** Map Elo rating (600..2000) to 0..100% mastery */
export function ratingToMasteryPercent(rating: number): number {
  const clamped = Math.max(ELO_CONFIG.MIN_RATING, Math.min(ELO_CONFIG.MAX_RATING, rating));
  const pct = ((clamped - ELO_CONFIG.MIN_RATING) / (ELO_CONFIG.MAX_RATING - ELO_CONFIG.MIN_RATING)) * 100;
  return Math.round(pct);
}

/** Compute updated Elo rating for a concept */
export function calculateNewElo(
  currentRating: number,
  itemDifficulty: Difficulty = 'medium',
  correct: boolean,
): number {
  const opponentRating = ELO_CONFIG.DIFFICULTY_RATINGS[itemDifficulty] ?? ELO_CONFIG.INITIAL_RATING;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
  const actualScore = correct ? 1 : 0;
  const newRating = currentRating + ELO_CONFIG.K_FACTOR * (actualScore - expectedScore);
  return Math.round(Math.max(ELO_CONFIG.MIN_RATING, Math.min(ELO_CONFIG.MAX_RATING, newRating)));
}

/** Determine FSRS grade from correctness and time taken */
export function determineFSRSGrade(correct: boolean, timeTakenSec: number, targetSec = 60): FSRSGrade {
  if (!correct) return 1; // Again
  if (timeTakenSec > targetSec * 1.5) return 2; // Hard (correct but slow)
  if (timeTakenSec < targetSec * 0.6) return 4; // Easy (fast and correct)
  return 3; // Good
}

/** Calculate updated FSRS item/concept review state */
export function calculateNextReview(
  currentState: { stability: number; difficulty: number; reps: number; lapses: number } | undefined,
  grade: FSRSGrade,
  now = Date.now(),
): { stability: number; difficulty: number; reps: number; lapses: number; dueTimestamp: number } {
  if (!currentState || currentState.reps === 0) {
    const s = FSRS_CONFIG.INITIAL_STABILITY[grade - 1];
    const d = FSRS_CONFIG.INITIAL_DIFFICULTY[grade - 1];
    const intervalDays = Math.max(1, Math.round(s));
    return {
      stability: s,
      difficulty: d,
      reps: 1,
      lapses: grade === 1 ? 1 : 0,
      dueTimestamp: now + intervalDays * 24 * 60 * 60 * 1000,
    };
  }

  let { stability, difficulty, reps, lapses } = currentState;

  if (grade === 1) {
    lapses += 1;
    reps = 0;
    stability = Math.max(0.4, stability * 0.3);
    difficulty = Math.min(10, difficulty + 0.8);
    return {
      stability,
      difficulty,
      reps,
      lapses,
      dueTimestamp: now + 1 * 24 * 60 * 60 * 1000, // 1 day retry
    };
  }

  // Grade >= 2 (Successful Recall)
  reps += 1;
  const diffAdjustment = (3 - grade) * 0.5;
  difficulty = Math.max(1, Math.min(10, difficulty + diffAdjustment));

  const hardMultiplier = grade === 2 ? 0.8 : 1.0;
  const easyMultiplier = grade === 4 ? 1.4 : 1.0;
  const factor = (11 - difficulty) * 0.25 * hardMultiplier * easyMultiplier;
  stability = Math.max(0.5, stability * (1 + factor));

  const intervalDays = Math.max(1, Math.round(stability));
  return {
    stability,
    difficulty,
    reps,
    lapses,
    dueTimestamp: now + intervalDays * 24 * 60 * 60 * 1000,
  };
}

/** Recalculate full user stats and streaks */
export function recalculateUserStats(
  attempts: AttemptRecord[],
  prevStats: UserStats,
): UserStats {
  const totalAttempts = attempts.length;
  if (totalAttempts === 0) {
    return getInitialState().userStats;
  }

  let totalCorrect = 0;
  let totalTimeSeconds = 0;
  const activityHistory: Record<string, number> = {};

  for (const att of attempts) {
    if (att.correct) totalCorrect += 1;
    totalTimeSeconds += att.timeTaken;
    const dateStr = new Date(att.timestamp).toISOString().slice(0, 10);
    activityHistory[dateStr] = (activityHistory[dateStr] || 0) + 1;
  }

  // Compute streaks from activity dates
  const activeDates = Object.keys(activityHistory).sort();
  let currentStreak = 0;
  let longestStreak = prevStats.longestStreak || 0;

  if (activeDates.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastActive = activeDates[activeDates.length - 1];

    if (lastActive === today || lastActive === yesterday) {
      currentStreak = 1;
      let checkDate = new Date(lastActive);
      for (let i = activeDates.length - 2; i >= 0; i--) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedDateStr = checkDate.toISOString().slice(0, 10);
        if (activeDates[i] === expectedDateStr) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  return {
    totalAttempts,
    totalCorrect,
    accuracyPercent: Math.round((totalCorrect / totalAttempts) * 100),
    totalTimeSeconds,
    avgTimePerQuestion: Math.round(totalTimeSeconds / totalAttempts),
    currentStreak,
    longestStreak,
    lastActiveDate: activeDates[activeDates.length - 1] || '',
    activityHistory,
  };
}

// ---------------------------------------------------------------------------
// Store Engine & Migration Safety
// ---------------------------------------------------------------------------

let memoryState: ProgressStoreState | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORE_CHANGE_EVENT));
  }
}

/** Load and safely migrate state from localStorage */
export function loadStore(): ProgressStoreState {
  if (memoryState) return memoryState;
  if (typeof window === 'undefined') return getInitialState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryState = migrateStore(parsed);
        return memoryState;
      }
    }

    // Attempt migration from legacy storage keys
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey);
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          memoryState = migrateStore(parsedLegacy);
          saveStore(memoryState);
          return memoryState;
        } catch {
          // ignore corrupted legacy key
        }
      }
    }
  } catch (err) {
    console.warn('[ProgressStore] Failed to load from localStorage:', err);
  }

  memoryState = getInitialState();
  return memoryState;
}

/** Migration logic forward to CURRENT_SCHEMA_VERSION without loss */
export function migrateStore(data: any): ProgressStoreState {
  const initial = getInitialState();
  if (!data || typeof data !== 'object') return initial;

  const version = typeof data.version === 'number' ? data.version : 1;
  const attempts: AttemptRecord[] = Array.isArray(data.attempts)
    ? data.attempts.map((a: any) => ({
        id: a.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: a.itemId || '',
        correct: Boolean(a.correct),
        timeTaken: typeof a.timeTaken === 'number' ? a.timeTaken : 30,
        timestamp: typeof a.timestamp === 'number' ? a.timestamp : Date.now(),
        sourceModule: a.sourceModule || 'unknown',
        difficulty: a.difficulty || 'medium',
        concepts: Array.isArray(a.concepts) ? a.concepts : [],
        selectedOption: a.selectedOption,
        userNotes: a.userNotes,
      }))
    : [];

  const conceptMasteries: Record<string, ConceptMastery> = {};
  if (data.conceptMasteries && typeof data.conceptMasteries === 'object') {
    for (const [key, val] of Object.entries(data.conceptMasteries as Record<string, any>)) {
      if (val && typeof val === 'object') {
        const rating = typeof val.rating === 'number' ? val.rating : ELO_CONFIG.INITIAL_RATING;
        const pct = ratingToMasteryPercent(rating);
        const status: MasteryStatus =
          pct >= 80 ? 'mastered' : pct >= 50 ? 'learning' : 'struggling';
        conceptMasteries[key] = {
          concept: key,
          rating,
          masteryPercent: pct,
          attemptsCount: val.attemptsCount || 0,
          correctCount: val.correctCount || 0,
          lastAttempted: val.lastAttempted || Date.now(),
          stability: val.stability || 1,
          difficulty: val.difficulty || 5,
          reps: val.reps || 0,
          dueTimestamp: val.dueTimestamp || Date.now(),
          status,
        };
      }
    }
  }

  const itemReviews: Record<string, ItemReviewState> = {};
  if (data.itemReviews && typeof data.itemReviews === 'object') {
    for (const [key, val] of Object.entries(data.itemReviews as Record<string, any>)) {
      if (val && typeof val === 'object') {
        itemReviews[key] = {
          itemId: key,
          lastReviewed: val.lastReviewed || Date.now(),
          dueTimestamp: val.dueTimestamp || Date.now(),
          stability: val.stability || 1,
          difficulty: val.difficulty || 5,
          reps: val.reps || 0,
          lapses: val.lapses || 0,
        };
      }
    }
  }

  const userStats = recalculateUserStats(attempts, initial.userStats);

  return {
    version: CURRENT_SCHEMA_VERSION,
    attempts,
    conceptMasteries,
    itemReviews,
    userStats,
  };
}

/** Save state to localStorage and notify all components */
export function saveStore(state: ProgressStoreState) {
  memoryState = state;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[ProgressStore] Failed to write localStorage:', err);
    }
  }
  notifyListeners();
}

/** Record a single practice or quiz attempt */
export function recordAttempt(
  attempt: Omit<AttemptRecord, 'id' | 'timestamp'> & { timestamp?: number },
): AttemptRecord {
  return recordBatchAttempts([attempt])[0];
}

/** Record multiple attempts atomically */
export function recordBatchAttempts(
  newAttempts: Array<Omit<AttemptRecord, 'id' | 'timestamp'> & { timestamp?: number }>,
): AttemptRecord[] {
  const current = loadStore();
  const now = Date.now();
  const createdRecords: AttemptRecord[] = [];

  const updatedAttempts = [...current.attempts];
  const updatedConceptMasteries = { ...current.conceptMasteries };
  const updatedItemReviews = { ...current.itemReviews };

  for (const raw of newAttempts) {
    const record: AttemptRecord = {
      ...raw,
      id: `att-${now}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: raw.timestamp || now,
    };
    createdRecords.push(record);
    updatedAttempts.push(record);

    const grade = determineFSRSGrade(record.correct, record.timeTaken);

    // 1. Update Item Review Schedule
    if (record.itemId) {
      const prevItemReview = updatedItemReviews[record.itemId];
      const nextReview = calculateNextReview(prevItemReview, grade, record.timestamp);
      updatedItemReviews[record.itemId] = {
        itemId: record.itemId,
        lastReviewed: record.timestamp,
        ...nextReview,
      };
    }

    // 2. Update Concept Elo Masteries
    for (const concept of record.concepts) {
      const cleanConcept = concept.trim();
      if (!cleanConcept) continue;

      const prev = updatedConceptMasteries[cleanConcept] || {
        concept: cleanConcept,
        rating: ELO_CONFIG.INITIAL_RATING,
        masteryPercent: ratingToMasteryPercent(ELO_CONFIG.INITIAL_RATING),
        attemptsCount: 0,
        correctCount: 0,
        lastAttempted: record.timestamp,
        stability: 1,
        difficulty: 5,
        reps: 0,
        lapses: 0,
        dueTimestamp: record.timestamp,
        status: 'unattempted' as MasteryStatus,
      };

      const newRating = calculateNewElo(prev.rating, record.difficulty, record.correct);
      const newMasteryPercent = ratingToMasteryPercent(newRating);
      const nextConceptReview = calculateNextReview(
        {
          stability: prev.stability,
          difficulty: prev.difficulty,
          reps: prev.reps,
          lapses: prev.lapses ?? 0,
        },
        grade,
        record.timestamp
      );

      const status: MasteryStatus =
        newMasteryPercent >= 80 ? 'mastered' : newMasteryPercent >= 50 ? 'learning' : 'struggling';

      updatedConceptMasteries[cleanConcept] = {
        ...prev,
        rating: newRating,
        masteryPercent: newMasteryPercent,
        attemptsCount: prev.attemptsCount + 1,
        correctCount: prev.correctCount + (record.correct ? 1 : 0),
        lastAttempted: record.timestamp,
        ...nextConceptReview,
        status,
      };
    }
  }

  const updatedStats = recalculateUserStats(updatedAttempts, current.userStats);

  const nextState: ProgressStoreState = {
    version: CURRENT_SCHEMA_VERSION,
    attempts: updatedAttempts,
    conceptMasteries: updatedConceptMasteries,
    itemReviews: updatedItemReviews,
    userStats: updatedStats,
  };

  saveStore(nextState);
  return createdRecords;
}

/** Reset all progress state to clean empty initial state */
export function resetProgressStore() {
  const initial = getInitialState();
  saveStore(initial);
}

// ---------------------------------------------------------------------------
// Derived Statistics Helpers
// ---------------------------------------------------------------------------

/** Get items that are due for spaced repetition review */
export function getDueItems(
  allItems: ContentItem[],
  limit = 20,
): { item: ContentItem; reviewState?: ItemReviewState; isDue: boolean; dueInDays: number }[] {
  const store = loadStore();
  const now = Date.now();

  const ratedItems = allItems.map((item) => {
    const review = store.itemReviews[item.id];
    if (!review) {
      // Unattempted items can be included as fresh due
      return { item, reviewState: undefined, isDue: true, dueInDays: 0 };
    }
    const diffMs = review.dueTimestamp - now;
    const dueInDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    return {
      item,
      reviewState: review,
      isDue: review.dueTimestamp <= now,
      dueInDays,
    };
  });

  // Prioritize due items first, then by earliest due timestamp
  return ratedItems
    .filter((r) => r.isDue)
    .sort((a, b) => {
      const aDue = a.reviewState?.dueTimestamp ?? 0;
      const bDue = b.reviewState?.dueTimestamp ?? 0;
      return aDue - bDue;
    })
    .slice(0, limit);
}

/** Get accuracy trend grouped into chronological buckets */
export function getAccuracyTrend(
  bucketSize = 5,
): { index: number; label: string; accuracy: number; count: number }[] {
  const store = loadStore();
  const attempts = store.attempts;
  if (attempts.length === 0) return [];

  const buckets: { index: number; label: string; accuracy: number; count: number }[] = [];
  const numBuckets = Math.ceil(attempts.length / bucketSize);

  for (let i = 0; i < numBuckets; i++) {
    const slice = attempts.slice(i * bucketSize, (i + 1) * bucketSize);
    const correctCount = slice.filter((a) => a.correct).length;
    const accuracy = Math.round((correctCount / slice.length) * 100);
    buckets.push({
      index: i + 1,
      label: `Q${i * bucketSize + 1}-${i * bucketSize + slice.length}`,
      accuracy,
      count: slice.length,
    });
  }

  return buckets;
}

/** Get time-per-question velocity trend */
export function getTimeTrend(
  bucketSize = 5,
): { index: number; label: string; avgTimeSec: number }[] {
  const store = loadStore();
  const attempts = store.attempts;
  if (attempts.length === 0) return [];

  const buckets: { index: number; label: string; avgTimeSec: number }[] = [];
  const numBuckets = Math.ceil(attempts.length / bucketSize);

  for (let i = 0; i < numBuckets; i++) {
    const slice = attempts.slice(i * bucketSize, (i + 1) * bucketSize);
    const totalSec = slice.reduce((sum, a) => sum + a.timeTaken, 0);
    buckets.push({
      index: i + 1,
      label: `Q${i * bucketSize + 1}-${i * bucketSize + slice.length}`,
      avgTimeSec: Math.round(totalSec / slice.length),
    });
  }

  return buckets;
}

/** SWOT analysis stats structure */
export interface SwotStats {
  strengths: ConceptMastery[];
  weaknesses: ConceptMastery[];
  opportunities: ConceptMastery[];
  threats: ConceptMastery[];
  statProfileKey: 'mastered-speed-fast' | 'high-accuracy-slow-speed' | 'balanced-mastery' | 'weakness-heavy' | 'decaying-retention' | 'unattempted-clean';
  overallAccuracy: number;
  totalMastered: number;
  totalWeak: number;
  totalDue: number;
}

/** Compute deterministic SWOT breakdown and stat profile key */
export function getSwotStatistics(): SwotStats {
  const store = loadStore();
  const concepts = Object.values(store.conceptMasteries);
  const now = Date.now();

  if (concepts.length === 0 || store.attempts.length === 0) {
    return {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      statProfileKey: 'unattempted-clean',
      overallAccuracy: 0,
      totalMastered: 0,
      totalWeak: 0,
      totalDue: 0,
    };
  }

  // Strengths: High mastery (>=75%) & at least 2 attempts
  const strengths = concepts
    .filter((c) => c.masteryPercent >= 75 && c.attemptsCount >= 2)
    .sort((a, b) => b.masteryPercent - a.masteryPercent);

  // Weaknesses: Low mastery (<50%) or low accuracy (<50%) with at least 1 attempt
  const weaknesses = concepts
    .filter((c) => (c.masteryPercent < 50 || (c.correctCount / c.attemptsCount) < 0.5) && c.attemptsCount >= 1)
    .sort((a, b) => a.masteryPercent - b.masteryPercent);

  // Opportunities: Near-mastery (50% - 74%) or 1 attempt with good promise
  const opportunities = concepts
    .filter((c) => c.masteryPercent >= 50 && c.masteryPercent < 75)
    .sort((a, b) => b.masteryPercent - a.masteryPercent);

  // Threats: Previously reviewed concepts that have lapsed or are overdue for revision
  const threats = concepts
    .filter((c) => c.dueTimestamp <= now && c.attemptsCount >= 1)
    .sort((a, b) => a.dueTimestamp - b.dueTimestamp);

  const overallAccuracy = store.userStats.accuracyPercent;
  const avgTime = store.userStats.avgTimePerQuestion;

  // Determine Stat Profile Key deterministically
  let statProfileKey: SwotStats['statProfileKey'] = 'balanced-mastery';

  if (threats.length >= 3 && strengths.length >= 2) {
    statProfileKey = 'decaying-retention';
  } else if (weaknesses.length > strengths.length) {
    statProfileKey = 'weakness-heavy';
  } else if (overallAccuracy >= 80 && avgTime > 75) {
    statProfileKey = 'high-accuracy-slow-speed';
  } else if (overallAccuracy >= 80 && avgTime <= 45) {
    statProfileKey = 'mastered-speed-fast';
  }

  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
    statProfileKey,
    overallAccuracy,
    totalMastered: strengths.length,
    totalWeak: weaknesses.length,
    totalDue: threats.length,
  };
}

// ---------------------------------------------------------------------------
// React Hook for Reactive Store Subscription
// ---------------------------------------------------------------------------

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memoryState = null;
      callback();
    }
  };
  const handleCustom = () => {
    callback();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener(STORE_CHANGE_EVENT, handleCustom);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STORE_CHANGE_EVENT, handleCustom);
    }
  };
}

export function useProgressStore(): ProgressStoreState & {
  recordAttempt: typeof recordAttempt;
  recordBatchAttempts: typeof recordBatchAttempts;
  resetProgressStore: typeof resetProgressStore;
} {
  const state = useSyncExternalStore(
    subscribe,
    () => loadStore(),
    () => getInitialState(),
  );

  return {
    ...state,
    recordAttempt,
    recordBatchAttempts,
    resetProgressStore,
  };
}
