// src/core/demoSeed.ts
// Deterministic 1-click Demo Data Seeder for Hackathon Judging & Video Demos.

import { STORAGE_KEY, CURRENT_SCHEMA_VERSION, type ProgressStoreData } from './progress';

export const DEMO_STREAM_KEY = 'ai_edu_stream_advisor_result_v1';
export const DEMO_RESUME_GAPS_KEY = 'ai_edu_resume_skill_gaps';
export const DEMO_LAST_VISITED_KEY = 'ai_edu_last_visited_module';

export function seedDemoData(): void {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // 1. Seed Realistic Progress Store
  const demoStore: ProgressStoreData = {
    version: CURRENT_SCHEMA_VERSION,
    lastResetTimestamp: now,
    activeDates: [
      new Date(now - 4 * dayMs).toISOString().split('T')[0],
      new Date(now - 3 * dayMs).toISOString().split('T')[0],
      new Date(now - 2 * dayMs).toISOString().split('T')[0],
      new Date(now - 1 * dayMs).toISOString().split('T')[0],
      new Date(now).toISOString().split('T')[0],
    ],
    eloRatings: {
      "Snells Law": 1460,
      "Pythagoras Theorem": 1420,
      "Two Pointers": 1390,
      "Organic Chemistry": 1210,
      "Calculus": 1180,
      "Electrodynamics & Magnetism": 980,
      "Direction Sense Test": 940,
      "Conflict Resolution": 910,
    },
    attempts: [
      {
        id: 'att-demo-01',
        itemId: 'pyq-2015-0001',
        conceptTags: ['Snells Law'],
        subject: 'Science',
        correct: true,
        timeTakenSec: 35,
        timestamp: now - 3 * dayMs,
        sourceModule: 'quiz',
      },
      {
        id: 'att-demo-02',
        itemId: 'comp9-ntse-001',
        conceptTags: ['Pythagoras Theorem'],
        subject: 'Mathematics',
        correct: true,
        timeTakenSec: 42,
        timestamp: now - 2 * dayMs,
        sourceModule: 'quiz',
      },
      {
        id: 'att-demo-03',
        itemId: 'entr-jee-001',
        conceptTags: ['Electrodynamics & Magnetism'],
        subject: 'Physics',
        correct: false,
        timeTakenSec: 65,
        timestamp: now - 1 * dayMs,
        sourceModule: 'quiz',
      },
      {
        id: 'att-demo-04',
        itemId: 'comp9-ntse-003',
        conceptTags: ['Direction Sense Test'],
        subject: 'Mental Ability (MAT)',
        correct: false,
        timeTakenSec: 55,
        timestamp: now - 1 * dayMs,
        sourceModule: 'quiz',
      },
      {
        id: 'att-demo-05',
        itemId: 'int-star-001',
        conceptTags: ['Conflict Resolution'],
        subject: 'Behavioral Competency',
        correct: false,
        timeTakenSec: 80,
        timestamp: now - 2 * 3600 * 1000,
        sourceModule: 'mock-interview',
      },
    ],
    fsrsItems: {
      'entr-jee-001': {
        itemId: 'entr-jee-001',
        stability: 0.5,
        difficulty: 7.0,
        reps: 2,
        lapses: 2,
        lastReview: now - 24 * 3600 * 1000,
        dueTimestamp: now - 2 * 3600 * 1000, // Due today
      },
      'comp9-ntse-003': {
        itemId: 'comp9-ntse-003',
        stability: 0.8,
        difficulty: 6.5,
        reps: 1,
        lapses: 1,
        lastReview: now - 12 * 3600 * 1000,
        dueTimestamp: now - 1 * 3600 * 1000, // Due today
      },
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStore));

    // 2. Seed Stream Advisor Result (PCM -> JEE Main)
    localStorage.setItem(
      DEMO_STREAM_KEY,
      JSON.stringify({
        recommendedStream: 'PCM (Physics, Chemistry, Maths)',
        runnerUpStream: 'PCB (Physics, Chemistry, Biology)',
        confidenceBand: 'High Fit (88%)',
        targetEntranceExam: 'JEE Main',
        timestamp: now,
      })
    );

    // 3. Seed Resume Skill Gaps
    localStorage.setItem(
      DEMO_RESUME_GAPS_KEY,
      JSON.stringify(['Docker Containerization', 'System Design & Architecture', 'AWS Cloud Services'])
    );

    // 4. Seed Last Visited Module
    localStorage.setItem(
      DEMO_LAST_VISITED_KEY,
      JSON.stringify({
        track: 'school',
        id: 'split-view',
        title: 'Split-Screen Paper & Answer Coach',
        timestamp: now,
      })
    );

    // Dispatch global store update event for instant reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('progress_store_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to seed demo data to localStorage:', err);
  }
}

export function clearDemoData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DEMO_STREAM_KEY);
    localStorage.removeItem(DEMO_RESUME_GAPS_KEY);
    localStorage.removeItem(DEMO_LAST_VISITED_KEY);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('progress_store_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to clear demo data:', err);
  }
}

export function isDemoDataLoaded(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.attempts) && parsed.attempts.length > 0;
  } catch {
    return false;
  }
}
