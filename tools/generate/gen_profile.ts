import fs from 'node:fs';
import path from 'node:path';
import { LLMGateway } from '../llm/gateway.js';
import * as profilePrompt from '../prompts/profile_summary.ts';

export interface GenOptions {
  force?: boolean;
  limit?: number;
}

export async function generateProfileSummaries(gateway: LLMGateway, options: GenOptions = {}) {
  console.log('--- Generating Profile Summaries ---');

  const contentDir = path.resolve(process.cwd(), 'content');
  const targetFile = path.join(contentDir, 'profile_summaries.json');

  // CRITICAL RULE: Deterministic pre-computation of all numbers in TypeScript
  const rawQuizzes = [
    { subject: 'Physics', total: 50, correct: 42, avgTimeSec: 45 },
    { subject: 'Chemistry', total: 40, correct: 28, avgTimeSec: 60 },
    { subject: 'Mathematics', total: 60, correct: 54, avgTimeSec: 50 },
  ];

  const totalAttempted = rawQuizzes.reduce((sum, q) => sum + q.total, 0);
  const totalCorrect = rawQuizzes.reduce((sum, q) => sum + q.correct, 0);
  const overallAccuracyPct = Math.round((totalCorrect / totalAttempted) * 100);

  const subjectAccuracies: Record<string, string> = {};
  for (const q of rawQuizzes) {
    subjectAccuracies[q.subject] = `${Math.round((q.correct / q.total) * 100)}% (${q.correct}/${q.total})`;
  }

  const computedStats = {
    totalAttempted,
    totalCorrect,
    overallAccuracyPct: `${overallAccuracyPct}%`,
    subjectAccuracies,
    topSubject: 'Mathematics (90%)',
    weakestSubject: 'Chemistry (70%)',
    currentStreakDays: 12,
  };

  const input: profilePrompt.ProfileSummaryInput = {
    computedStats,
    context: 'Class 12 Science Stream Student preparing for Engineering Entrance Exams',
  };

  const promptText = profilePrompt.buildUserPrompt(input);
  const summaryResult = await gateway.completeJSON(profilePrompt.outputSchema, {
    systemPrompt: profilePrompt.systemPrompt,
    userPrompt: promptText,
    forceRefresh: options.force,
  });

  const output = [
    {
      id: 'profile-summary-student-01',
      computedStats,
      summary: summaryResult,
    },
  ];

  fs.writeFileSync(targetFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Saved profile summary to ${targetFile}`);
  return output;
}
