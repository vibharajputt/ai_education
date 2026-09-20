// src/core/progress.ts
// Central localStorage-backed, versioned, migration-safe progress store for practice & progress cluster.
// Computes Elo concept mastery, FSRS due scheduling, accuracy trends, and SWOT profiles 100% deterministically.

import { useState, useEffect } from 'react';

export const CURRENT_SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'ai_edu_progress_store_v1';

// Tunable Elo & Spaced Repetition Constants
export const ELO_CONFIG = {
  INITIAL_ELO: 1200,
  K_FACTOR: 32,
  QUESTION_ELO: 1200,
};

export interface AttemptRecord {
  id: string;
  itemId: string;
  conceptTags: string[];
  subject?: string;
  correct: boolean;
  timeTakenSec: number;
  timestamp: number;
  sourceModule: string; // 'quiz' | 'split-view' | 'sheet-generator' | etc.
}

export interface FsrsItemState {
  itemId: string;
  stability: number; // In days
  difficulty: number; // 1 to 10
  reps: number;
  lapses: number;
  lastReview: number; // timestamp
  dueTimestamp: number; // timestamp
}

export interface ProgressStoreData {
  version: number;
  attempts: AttemptRecord[];
  eloRatings: Record<string, number>; // conceptTag -> Elo rating
  fsrsItems: Record<string, FsrsItemState>; // itemId -> FSRS state
  activeDates: string[]; // YYYY-MM-DD list for streak tracking
  lastResetTimestamp: number;
}

export interface ConceptMasteryInfo {
  conceptTag: string;
  elo: number;
  attemptsCount: number;
  correctCount: number;
  accuracyPct: number;
  status: 'mastered' | 'learning' | 'weak';
}

export interface SwotNarrativeProfile {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  nextActions: string[];
}

export interface SwotStatsResult {
  totalAttempted: number;
  totalCorrect: number;
  overallAccuracyPct: number;
  avgTimePerQuestionSec: number;
  topSubject: string;
  weakestSubject: string;
  currentStreakDays: number;
  masteredConceptsCount: number;
  weakConceptsCount: number;
  narrative: SwotNarrativeProfile;
}

// Default initial state
const defaultStoreData: ProgressStoreData = {
  version: CURRENT_SCHEMA_VERSION,
  attempts: [],
  eloRatings: {},
  fsrsItems: {},
  activeDates: [],
  lastResetTimestamp: Date.now(),
};

// ---------------------------------------------------------------------------
// Store I/O & Migration Engine
// ---------------------------------------------------------------------------

function loadRawStore(): ProgressStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultStoreData };
    const parsed = JSON.parse(raw);

    // Migration Check
    if (parsed && typeof parsed.version === 'number') {
      return migrateStoreData(parsed);
    }
    return { ...defaultStoreData };
  } catch {
    return { ...defaultStoreData };
  }
}

function saveRawStore(data: ProgressStoreData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom DOM event for instant multi-component reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('progress_store_updated'));
    }
  } catch (err) {
    console.error('Failed to save progress store to localStorage:', err);
  }
}

/**
 * Migration-safe handler for store version bumps.
 */
export function migrateStoreData(oldData: any): ProgressStoreData {
  let data = { ...oldData };

  if (data.version === undefined || data.version < 1) {
    data.version = 1;
    data.attempts = Array.isArray(data.attempts) ? data.attempts : [];
    data.eloRatings = data.eloRatings && typeof data.eloRatings === 'object' ? data.eloRatings : {};
    data.fsrsItems = data.fsrsItems && typeof data.fsrsItems === 'object' ? data.fsrsItems : {};
    data.activeDates = Array.isArray(data.activeDates) ? data.activeDates : [];
    data.lastResetTimestamp = data.lastResetTimestamp || Date.now();
  }

  // Future schema migration rules (e.g. version 2, 3) can be chained cleanly here
  data.version = CURRENT_SCHEMA_VERSION;
  return data as ProgressStoreData;
}

// ---------------------------------------------------------------------------
// Attempt Recorder & Rating Engine
// ---------------------------------------------------------------------------

export interface RecordAttemptInput {
  itemId: string;
  conceptTags: string[];
  subject?: string;
  correct: boolean;
  timeTakenSec: number;
  sourceModule: string;
}

/**
 * Records a practice attempt, updates Elo ratings, calculates FSRS due timestamps, and updates streaks.
 */
export function recordAttempt(input: RecordAttemptInput): AttemptRecord {
  const store = loadRawStore();
  const now = Date.now();
  const dateStr = new Date(now).toISOString().split('T')[0];

  const attempt: AttemptRecord = {
    id: `att-${now}-${Math.random().toString(36).substr(2, 6)}`,
    itemId: input.itemId,
    conceptTags: input.conceptTags.length > 0 ? input.conceptTags : ['General'],
    subject: input.subject || 'General',
    correct: input.correct,
    timeTakenSec: Math.max(1, input.timeTakenSec),
    timestamp: now,
    sourceModule: input.sourceModule,
  };

  // 1. Update Attempts List
  store.attempts.push(attempt);

  // 2. Update Streak Active Dates
  if (!store.activeDates.includes(dateStr)) {
    store.activeDates.push(dateStr);
  }

  // 3. Update Elo Ratings per Concept Tag
  attempt.conceptTags.forEach((tag) => {
    const currentElo = store.eloRatings[tag] ?? ELO_CONFIG.INITIAL_ELO;
    const expected = 1 / (1 + Math.pow(10, (ELO_CONFIG.QUESTION_ELO - currentElo) / 400));
    const actual = input.correct ? 1 : 0;
    const newElo = Math.round(currentElo + ELO_CONFIG.K_FACTOR * (actual - expected));
    store.eloRatings[tag] = Math.max(800, Math.min(2200, newElo));
  });

  // 4. Update FSRS Spaced Repetition Due State for Item
  const prevFsrs = store.fsrsItems[input.itemId] || {
    itemId: input.itemId,
    stability: 1.0,
    difficulty: 5.0,
    reps: 0,
    lapses: 0,
    lastReview: now,
    dueTimestamp: now,
  };

  let newReps = prevFsrs.reps + 1;
  let newLapses = prevFsrs.lapses + (input.correct ? 0 : 1);
  let newStability = prevFsrs.stability;

  if (input.correct) {
    newStability = Math.min(365, Number((prevFsrs.stability * (1.5 + (newReps * 0.2))).toFixed(1)));
  } else {
    newStability = Math.max(0.5, Number((prevFsrs.stability * 0.4).toFixed(1)));
  }

  const dueDays = Math.max(1, Math.round(newStability));
  const newDueTimestamp = now + dueDays * 24 * 60 * 60 * 1000;

  store.fsrsItems[input.itemId] = {
    itemId: input.itemId,
    stability: newStability,
    difficulty: prevFsrs.difficulty,
    reps: newReps,
    lapses: newLapses,
    lastReview: now,
    dueTimestamp: newDueTimestamp,
  };

  saveRawStore(store);
  return attempt;
}

/**
 * Resets store cleanly to first-run empty state.
 */
export function resetStore(): void {
  saveRawStore({
    version: CURRENT_SCHEMA_VERSION,
    attempts: [],
    eloRatings: {},
    fsrsItems: {},
    activeDates: [],
    lastResetTimestamp: Date.now(),
  });
}

// ---------------------------------------------------------------------------
// Deterministic Analytics & Derived Data Queries
// ---------------------------------------------------------------------------

export function getAttemptsHistory(): AttemptRecord[] {
  return loadRawStore().attempts;
}

export function getConceptMasteryList(): ConceptMasteryInfo[] {
  const store = loadRawStore();
  const conceptStats = new Map<string, { total: number; correct: number }>();

  store.attempts.forEach((att) => {
    att.conceptTags.forEach((tag) => {
      const existing = conceptStats.get(tag) || { total: 0, correct: 0 };
      existing.total += 1;
      if (att.correct) existing.correct += 1;
      conceptStats.set(tag, existing);
    });
  });

  const result: ConceptMasteryInfo[] = [];

  // Combine tags from attempts & eloRatings dictionary
  const allTags = Array.from(new Set([...Object.keys(store.eloRatings), ...Array.from(conceptStats.keys())]));

  allTags.forEach((tag) => {
    const stats = conceptStats.get(tag) || { total: 0, correct: 0 };
    const elo = store.eloRatings[tag] ?? ELO_CONFIG.INITIAL_ELO;
    const accuracyPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 50;

    let status: ConceptMasteryInfo['status'] = 'learning';
    if (elo >= 1350 || accuracyPct >= 80) status = 'mastered';
    else if (elo <= 1100 || accuracyPct <= 50) status = 'weak';

    result.push({
      conceptTag: tag,
      elo,
      attemptsCount: stats.total,
      correctCount: stats.correct,
      accuracyPct,
      status,
    });
  });

  return result.sort((a, b) => b.elo - a.elo);
}

export function getStreakStats(): { currentStreak: number; maxStreak: number; activeDates: string[] } {
  const store = loadRawStore();
  const dates = [...store.activeDates].sort();
  if (dates.length === 0) {
    return { currentStreak: 0, maxStreak: 0, activeDates: [] };
  }

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  // Check if today or yesterday is active for current streak validity
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const hasRecentActivity = dates.includes(todayStr) || dates.includes(yesterdayStr);
  if (!hasRecentActivity) currentStreak = 0;

  return { currentStreak, maxStreak, activeDates: dates };
}

export function getAccuracyTrend(): Array<{ date: string; accuracyPct: number; attempts: number }> {
  const store = loadRawStore();
  const buckets = new Map<string, { total: number; correct: number }>();

  store.attempts.forEach((att) => {
    const dStr = new Date(att.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const b = buckets.get(dStr) || { total: 0, correct: 0 };
    b.total += 1;
    if (att.correct) b.correct += 1;
    buckets.set(dStr, b);
  });

  return Array.from(buckets.entries()).map(([date, data]) => ({
    date,
    accuracyPct: Math.round((data.correct / data.total) * 100),
    attempts: data.total,
  }));
}

export function getTimePerQuestionTrend(): Array<{ session: string; avgTimeSec: number }> {
  const store = loadRawStore();
  if (store.attempts.length === 0) return [];

  const chunks: Array<{ session: string; avgTimeSec: number }> = [];
  const chunkSize = 5;

  for (let i = 0; i < store.attempts.length; i += chunkSize) {
    const slice = store.attempts.slice(i, i + chunkSize);
    const avg = Math.round(slice.reduce((acc, curr) => acc + curr.timeTakenSec, 0) / slice.length);
    chunks.push({
      session: `Quiz ${Math.floor(i / chunkSize) + 1}`,
      avgTimeSec: avg,
    });
  }

  return chunks;
}

export function getDueForRevisionItems(): FsrsItemState[] {
  const store = loadRawStore();
  const now = Date.now();
  const items = Object.values(store.fsrsItems);
  return items.filter((item) => item.dueTimestamp <= now + 12 * 60 * 60 * 1000).sort((a, b) => a.dueTimestamp - b.dueTimestamp);
}

/**
 * Deterministically computes SWOT statistics and matches profile narrative without live AI calls.
 */
export function getSwotAnalysis(): SwotStatsResult {
  const store = loadRawStore();
  const attempts = store.attempts;

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const overallAccuracyPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const avgTimePerQuestionSec =
    totalAttempted > 0 ? Math.round(attempts.reduce((a, b) => a + b.timeTakenSec, 0) / totalAttempted) : 0;

  // Subject Accuracies
  const subjectStats = new Map<string, { total: number; correct: number }>();
  attempts.forEach((a) => {
    const subj = a.subject || 'General STEM';
    const s = subjectStats.get(subj) || { total: 0, correct: 0 };
    s.total += 1;
    if (a.correct) s.correct += 1;
    subjectStats.set(subj, s);
  });

  let topSubject = 'Science & Maths';
  let weakestSubject = 'Formula Application';
  let topAcc = -1;
  let weakAcc = 999;

  subjectStats.forEach((val, key) => {
    const acc = Math.round((val.correct / val.total) * 100);
    if (acc > topAcc) {
      topAcc = acc;
      topSubject = `${key} (${acc}%)`;
    }
    if (acc < weakAcc) {
      weakAcc = acc;
      weakestSubject = `${key} (${acc}%)`;
    }
  });

  const streak = getStreakStats();
  const masteryList = getConceptMasteryList();

  const masteredConceptsCount = masteryList.filter((m) => m.status === 'mastered').length;
  const weakConceptsCount = masteryList.filter((m) => m.status === 'weak').length;

  // Pre-generated Narrative Bucketing Matrix
  let narrative: SwotNarrativeProfile;

  if (totalAttempted === 0) {
    narrative = {
      summary: 'No practice data recorded yet. Take a Daily or Weekly Quiz to generate your real-time SWOT analysis.',
      strengths: ['First-run workspace ready for practice'],
      weaknesses: ['No questions attempted yet'],
      opportunities: ['Complete a 10-question Daily Quiz to index initial strengths'],
      threats: ['Inactivity leads to knowledge decay'],
      nextActions: ['Click "Start Practice Quiz" to generate your baseline SWOT profile.'],
    };
  } else if (overallAccuracyPct >= 80) {
    narrative = {
      summary: `High mastery demonstrated across practice sets with ${overallAccuracyPct}% accuracy. Strong retention in ${topSubject}.`,
      strengths: [
        `High precision accuracy (${overallAccuracyPct}%) across ${totalAttempted} questions`,
        `Strong concept retention in ${topSubject}`,
        `${streak.currentStreak}-day active study streak`,
      ],
      weaknesses: [
        avgTimePerQuestionSec > 60 ? `Average time per question is slightly slow (${avgTimePerQuestionSec}s)` : 'Minor formula speed gaps under timed conditions',
      ],
      opportunities: ['Target hard Board Exam paper derivations to achieve 95%+ rank excellence'],
      threats: ['Overconfidence in solved chapters without periodic FSRS revision'],
      nextActions: ['Generate a 25-question Weekly Mock Paper in Sheet Generator.', 'Review FSRS revision queue items.'],
    };
  } else if (overallAccuracyPct >= 60) {
    narrative = {
      summary: `Steady progress with ${overallAccuracyPct}% overall accuracy. Needs targeted revision in ${weakestSubject}.`,
      strengths: [
        `Consistent practice effort across ${totalAttempted} questions`,
        `Solid accuracy in ${topSubject}`,
      ],
      weaknesses: [
        `Accuracy drop observed in ${weakestSubject}`,
        `${weakConceptsCount} weak concept tags identified for revision`,
      ],
      opportunities: ['Use Formula Mnemonics & Chapter Summaries to bridge concept gaps'],
      threats: ['Repeated errors on multi-step numerical questions'],
      nextActions: ['Complete a focused 10-question quiz in weaker chapters.', 'Review step-by-step explanations.'],
    };
  } else {
    narrative = {
      summary: `Accuracy is currently at ${overallAccuracyPct}%. Focus on fundamental concept reviews before timed practice.`,
      strengths: [`Active engagement with ${totalAttempted} practice attempts recorded`],
      weaknesses: [
        `Low accuracy in ${weakestSubject}`,
        `Multiple conceptual misunderstandings in recent quizzes`,
      ],
      opportunities: ['Revisit step breakdowns and simplified explanations in Split-View Answer Coach'],
      threats: ['Frustration from attempting hard questions without foundational mastery'],
      nextActions: ['Switch to Easy difficulty quizzes in Quiz Module.', 'Review foundational mnemonics.'],
    };
  }

  return {
    totalAttempted,
    totalCorrect,
    overallAccuracyPct,
    avgTimePerQuestionSec,
    topSubject,
    weakestSubject,
    currentStreakDays: streak.currentStreak,
    masteredConceptsCount,
    weakConceptsCount,
    narrative,
  };
}

// ---------------------------------------------------------------------------
// React Hook for Reactive UI Updating
// ---------------------------------------------------------------------------

export function useProgressStore() {
  const [store, setStore] = useState<ProgressStoreData>(() => loadRawStore());

  useEffect(() => {
    const handleUpdate = () => {
      setStore(loadRawStore());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('progress_store_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('progress_store_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, []);

  return {
    store,
    attempts: store.attempts,
    recordAttempt,
    resetStore,
    conceptMastery: getConceptMasteryList(),
    streakStats: getStreakStats(),
    accuracyTrend: getAccuracyTrend(),
    timeTrend: getTimePerQuestionTrend(),
    dueItems: getDueForRevisionItems(),
    swotAnalysis: getSwotAnalysis(),
  };
}
