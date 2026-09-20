// src/modules/weak-topics/services/narratives.ts
// Pre-computed diagnostic narratives keyed by statistical profile buckets.
// Strictly zero runtime LLM calls — matching is performed deterministically in TypeScript.

import type { SwotNarrativeProfile } from '../types';
import type { SwotStats } from '@core';

export const NARRATIVE_PROFILES: Record<SwotStats['statProfileKey'], SwotNarrativeProfile> = {
  'mastered-speed-fast': {
    key: 'mastered-speed-fast',
    title: 'High-Velocity Exam Mastery',
    badge: 'Elite Tier • Speed & Precision',
    summary:
      'Your profile demonstrates outstanding conceptual command (>=80% accuracy) paired with rapid solution velocity (<=45s/q). You are operating in top percentile speed and precision.',
    strengthsNarrative:
      'Core formulas and calculation steps are automatic. You quickly eliminate distractors in multiple-choice questions and navigate derivations with minimal hesitation.',
    weaknessesNarrative:
      'Occasional minor slip-ups occur only on multi-concept synthesis problems or complex sign conventions under time pressure.',
    opportunitiesNarrative:
      'Focus on high-order board long-answer questions (5 marks) and multi-step competitive exam problems to convert 90%+ scores into perfect scores.',
    threatsNarrative:
      'Beware of overconfidence leading to skimming question constraints (e.g. overlooking "except", "not", or unit conversions).',
    studyStrategy: [
      'Simulate full-length 3-hour mock board papers to test sustained stamina.',
      'Audit calculation shortcuts and verify unit dimensional consistency.',
      'Practice step-by-step written presentation for maximum subjective marks.',
    ],
    recommendedDailyMinutes: 45,
  },

  'high-accuracy-slow-speed': {
    key: 'high-accuracy-slow-speed',
    title: 'High Precision with Velocity Bottleneck',
    badge: 'Accurate • Speed Needs Calibration',
    summary:
      'You maintain strong conceptual accuracy (>=80%) but take significant time per question (>75s/q). While understanding is solid, exam time limits could become a constraint.',
    strengthsNarrative:
      'Exceptional fundamental grounding. You avoid common trap answers and reason carefully through each scientific principle.',
    weaknessesNarrative:
      'Over-verification and re-calculating known algebraic steps leads to pacing bottlenecks on timed papers.',
    opportunitiesNarrative:
      'Adopting standard formula shortcuts, diagram sketches, and mental arithmetic can easily cut solution time by 30-40%.',
    threatsNarrative:
      'Risk of leaving the last 2-3 subjective questions unattempted on board exams due to running out of time in the final 30 minutes.',
    studyStrategy: [
      'Engage in 10-question timed speed drills daily with a strict 45-second cap per MCQ.',
      'Memorize frequently recurring square roots, constants, and standard trigonometric ratios.',
      'Practice first-pass triage: solve direct formula questions in pass 1, lengthy derivations in pass 2.',
    ],
    recommendedDailyMinutes: 60,
  },

  'balanced-mastery': {
    key: 'balanced-mastery',
    title: 'Steady Progressive Growth',
    badge: 'Balanced Development',
    summary:
      'Your learning metrics show consistent steady progress across syllabus units with balanced pacing and reliable baseline retention.',
    strengthsNarrative:
      'Solid grasp of medium-difficulty questions and consistent day-to-day study rhythm.',
    weaknessesNarrative:
      'Difficulty spikes observed when transitioning from textbook formula application to non-routine problem variants.',
    opportunitiesNarrative:
      'A cluster of concepts is currently sitting at 60-75% mastery. A single targeted review cycle will push them into full mastery.',
    threatsNarrative:
      'Uneven review intervals can allow older chapters to decay while studying newer syllabus units.',
    studyStrategy: [
      'Prioritize your FSRS Due Revision Queue daily before starting fresh chapters.',
      'Generate chapter-wise practice worksheets with mixed 3-mark and 5-mark questions.',
      'Consolidate handwritten formula cheat sheets for quick weekly review.',
    ],
    recommendedDailyMinutes: 60,
  },

  'weakness-heavy': {
    key: 'weakness-heavy',
    title: 'Targeted Remedial Intervention Required',
    badge: 'Foundation Rebuild Mode',
    summary:
      'Analysis indicates several fundamental concept gaps where accuracy has fallen below 50%. A systematic step-by-step rebuild of foundational topics is recommended.',
    strengthsNarrative:
      'Willingness to attempt diverse questions and identify where conceptual hurdles exist.',
    weaknessesNarrative:
      'Struggling with core prerequisite definitions, formula transformations, and standard unit conversions.',
    opportunitiesNarrative:
      'Clearing 2-3 foundational roadblock topics will unlock rapid score improvements across multiple related chapters.',
    threatsNarrative:
      'Repeatedly testing without reviewing underlying derivations can reinforce misconceptions and lower confidence.',
    studyStrategy: [
      'Step back from timed mocks and work through step-by-step worked solutions.',
      'Use Concept Maps and Formula Mnemonics to anchor fundamental relationships.',
      'Re-attempt failed questions after 24 hours to confirm concept retention.',
    ],
    recommendedDailyMinutes: 90,
  },

  'decaying-retention': {
    key: 'decaying-retention',
    title: 'Spaced Repetition Recovery Needed',
    badge: 'Retention Decaying • High Due Load',
    summary:
      'You have demonstrated mastery in the past, but multiple concepts are now overdue for FSRS review, causing memory stability decay.',
    strengthsNarrative:
      'High historical capacity and proven ability to master complex STEM topics.',
    weaknessesNarrative:
      'Delayed review cycles leading to hesitation and forgotten constant values on earlier chapters.',
    opportunitiesNarrative:
      'Quick active recall flashcards or a 15-minute refresher worksheet will restore full stability with minimal effort.',
    threatsNarrative:
      'Allowing spaced review intervals to lapse further will require relearning topics from scratch.',
    studyStrategy: [
      'Clear the FSRS Due Queue immediately using the 1-click Practice button.',
      'Generate a mixed-chapter worksheet covering only overdue topics.',
      'Schedule 15 minutes of flashcard active recall every morning.',
    ],
    recommendedDailyMinutes: 45,
  },

  'unattempted-clean': {
    key: 'unattempted-clean',
    title: 'Baseline Diagnostic Ready',
    badge: 'Initial Onboarding',
    summary:
      'No practice attempts have been logged yet. Complete an initial 10-question diagnostic quiz to generate your customized SWOT matrix and personalized study roadmap.',
    strengthsNarrative: 'Fresh slate ready for structured spaced repetition learning.',
    weaknessesNarrative: 'Diagnostic metrics will appear after your first completed quiz.',
    opportunitiesNarrative: 'Complete a diagnostic test across all subjects to identify quick-win topics.',
    threatsNarrative: 'Delaying diagnostic evaluation leaves knowledge blind spots undetected.',
    studyStrategy: [
      'Start with a 10-question Daily Drill to calibrate your baseline Elo ratings.',
      'Review the step-by-step explanations for every question you solve.',
      'Check your updated SWOT matrix immediately following the quiz.',
    ],
    recommendedDailyMinutes: 30,
  },
};

export function getNarrativeProfile(key: SwotStats['statProfileKey']): SwotNarrativeProfile {
  return NARRATIVE_PROFILES[key] || NARRATIVE_PROFILES['balanced-mastery'];
}
