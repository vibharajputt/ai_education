// src/core/demoSeed.ts
// Deterministic 60-attempt demo seed generator.
// Uses existing itemIds from question-bank.json and pyq-10th.json.
// Zero Math.random() — byte-identical on every execution.

import { recordBatchAttempts, clearStore, loadStore, type AttemptRecord } from './progress';
import type { Difficulty } from './types';

interface SeedItemMeta {
  id: string;
  concepts: string[];
  difficulty: Difficulty;
}

export const DEMO_SEED_ITEMS: SeedItemMeta[] = [
  // 8 items from question-bank.json (all 8)
  { id: 'qb-phy-11-001', concepts: ['Dimensional Analysis', 'Significant Figures'], difficulty: 'medium' },
  { id: 'qb-phy-11-002', concepts: ['Instantaneous Velocity', 'Calculus Kinematics'], difficulty: 'easy' },
  { id: 'qb-phy-11-003', concepts: ['Friction', 'Free Body Diagram'], difficulty: 'medium' },
  { id: 'qb-chem-11-001', concepts: ['Photoelectric Effect', 'Work Function'], difficulty: 'hard' },
  { id: 'qb-chem-12-001', concepts: ['Nernst Equation', 'EMF of Cell'], difficulty: 'medium' },
  { id: 'qb-math-12-001', concepts: ['Definite Integrals', 'Properties of Definite Integrals'], difficulty: 'easy' },
  { id: 'qb-math-12-002', concepts: ['Linear Differential Equations', 'Integrating Factor'], difficulty: 'hard' },
  { id: 'qb-bio-12-001', concepts: ['DNA Replication', 'Semi-Conservative Model'], difficulty: 'medium' },

  // 20 items from pyq-10th.json
  // Electricity (4)
  { id: 'pyq-2015-0007', concepts: ['Ohms Law'], difficulty: 'medium' },
  { id: 'pyq-2015-0008', concepts: ['Resistors in Series & Parallel'], difficulty: 'easy' },
  { id: 'pyq-2015-0009', concepts: ['Joule Heating Effect'], difficulty: 'medium' },
  { id: 'pyq-2016-0088', concepts: ['Ohms Law'], difficulty: 'hard' },

  // Light (4)
  { id: 'pyq-2015-0001', concepts: ['Snells Law'], difficulty: 'medium' },
  { id: 'pyq-2015-0002', concepts: ['Lens Formula'], difficulty: 'hard' },
  { id: 'pyq-2015-0003', concepts: ['Refractive Index'], difficulty: 'easy' },
  { id: 'pyq-2016-0082', concepts: ['Snells Law'], difficulty: 'medium' },

  // Chemical Reactions (4)
  { id: 'pyq-2015-0013', concepts: ['Balancing Equations'], difficulty: 'hard' },
  { id: 'pyq-2015-0014', concepts: ['Types of Reactions'], difficulty: 'easy' },
  { id: 'pyq-2015-0015', concepts: ['Redox & Displacement'], difficulty: 'medium' },
  { id: 'pyq-2016-0094', concepts: ['Balancing Equations'], difficulty: 'easy' },

  // Polynomials (4)
  { id: 'pyq-2015-0043', concepts: ['Zeroes of Quadratic Polynomial'], difficulty: 'hard' },
  { id: 'pyq-2015-0044', concepts: ['Relationship between Coefficients'], difficulty: 'easy' },
  { id: 'pyq-2015-0045', concepts: ['Zeroes of Quadratic Polynomial'], difficulty: 'medium' },
  { id: 'pyq-2016-0124', concepts: ['Zeroes of Quadratic Polynomial'], difficulty: 'easy' },

  // Trigonometry (4)
  { id: 'pyq-2015-0061', concepts: ['Trigonometric Ratios'], difficulty: 'medium' },
  { id: 'pyq-2015-0062', concepts: ['Standard Values (30,45,60)'], difficulty: 'hard' },
  { id: 'pyq-2015-0063', concepts: ['Trigonometric Identities'], difficulty: 'easy' },
  { id: 'pyq-2015-0064', concepts: ['Angle of Elevation & Depression'], difficulty: 'easy' },
];

/**
 * Deterministic incorrect indices for 60 attempts:
 * Exactly 21 incorrect indices out of 60 = 35% incorrect, 65% correct.
 */
const INCORRECT_INDICES = new Set([
  2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 58, 59,
]);

/**
 * Generate 60 AttemptRecord payloads.
 * Timestamps spread across 0..13 days ago (last 14 days).
 * sourceModule alternates between 'quiz' and 'pyq-analyzer'.
 */
export function generateDemoAttempts(
  referenceTime: number = Date.now(),
): Array<Omit<AttemptRecord, 'id' | 'timestamp'> & { timestamp: number }> {
  const attempts: Array<Omit<AttemptRecord, 'id' | 'timestamp'> & { timestamp: number }> = [];

  for (let i = 0; i < 60; i++) {
    const item = DEMO_SEED_ITEMS[i % DEMO_SEED_ITEMS.length];
    const correct = !INCORRECT_INDICES.has(i);

    // Days ago ranges from 0 (today) to 13 (13 days ago)
    const daysAgo = Math.floor((i * 14) / 60);
    // Deterministic offset within the day (0 to 12 hours)
    const minuteOffset = ((i * 37) % 720) * 60 * 1000;
    const timestamp = referenceTime - daysAgo * 86400000 - minuteOffset;

    // Time taken: deterministic pseudo-values between 28 and 82 seconds
    const timeTaken = 28 + ((i * 13) % 55);

    // sourceModule alternates between 'quiz' and 'pyq-analyzer'
    const sourceModule = i % 2 === 0 ? 'quiz' : 'pyq-analyzer';

    attempts.push({
      itemId: item.id,
      correct,
      timeTaken,
      timestamp,
      sourceModule,
      difficulty: item.difficulty,
      concepts: [...item.concepts],
    });
  }

  return attempts;
}

/**
 * Load demo data into the progress store and optionally navigate.
 */
export function loadDemoData(navigate?: (to: string) => void): void {
  const seed = generateDemoAttempts();
  recordBatchAttempts(seed);
  if (navigate) {
    navigate('/school/progress-report');
  }
}

/**
 * Clear all progress data and optionally navigate home.
 */
export function clearDemoData(navigate?: (to: string) => void): void {
  clearStore();
  if (navigate) {
    navigate('/');
  }
}

/**
 * Automatically seeds demo data if ?demo=1 URL query parameter is present.
 * Returns true if auto-seeded.
 */
export function checkAndAutoSeedDemo(navigate?: (to: string) => void): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('demo') === '1') {
    const store = loadStore();
    if (store.attempts.length === 0) {
      loadDemoData(navigate);
      return true;
    }
  }
  return false;
}
