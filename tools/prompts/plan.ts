import { z } from 'zod';

export const version = '1.0.0';

export interface PlanInput {
  goal: string;
  deadline: string;
  hoursPerDay: number;
  syllabusUnits: string[];
  currentMastery: Record<string, number>; // 0 to 100
}

export const systemPrompt = `You are a high-performance academic tutor and study planner.
Your job is to create realistic, time-bounded daily study plans for students.

CRITICAL CONSTRAINTS:
1. Daily Time Limit: Total scheduled minutes across all blocks on any given day MUST NOT exceed (hoursPerDay * 60) minutes.
2. Coverage Requirement: Every single unit listed in "syllabusUnits" MUST either:
   - Appear in at least one study block across the days, OR
   - Be explicitly listed in the "dropped" array with a valid justification (e.g., already 100% mastered).
3. Mastery Prioritization: Spend more time on units with lower mastery scores.

You MUST respond strictly in valid JSON matching the requested schema.`;

export function buildUserPrompt(input: PlanInput): string {
  return `Study Goal: ${input.goal}
Deadline: ${input.deadline}
Max Daily Study Hours: ${input.hoursPerDay} hours (${input.hoursPerDay * 60} minutes/day)

Syllabus Units to Cover:
${input.syllabusUnits.map((u) => `- ${u} (Current Mastery: ${input.currentMastery[u] ?? 0}%)`).join('\n')}

HARD MANDATES:
1. Total minutes per day <= ${input.hoursPerDay * 60}.
2. Ensure every unit in syllabusUnits is either scheduled in blocks or listed under "dropped" with a reason.`;
}

export const outputSchema = z.object({
  days: z.array(
    z.object({
      date: z.string().describe('Date string YYYY-MM-DD or Day N'),
      blocks: z.array(
        z.object({
          topic: z.string().describe('Syllabus unit or topic name'),
          minutes: z.number().describe('Duration in minutes'),
          activity: z.string().describe('Revision, practice, concept read, etc.'),
          itemIds: z.array(z.string()).default([]).describe('Optional list of content item IDs'),
        })
      ),
    })
  ),
  assumptions: z.array(z.string()).describe('Key assumptions made while planning'),
  riskNotes: z.array(z.string()).describe('Potential risks to schedule completion'),
  dropped: z.array(
    z.object({
      unit: z.string(),
      reason: z.string(),
    })
  ).default([]).describe('Units explicitly omitted from the plan and reasons'),
});

export type PlanOutput = z.infer<typeof outputSchema>;

/**
 * Deterministic TypeScript code validation for Plan Output.
 * Validates daily time limits and 100% syllabus unit coverage.
 */
export function validatePlanCode(plan: PlanOutput, input: PlanInput): void {
  const maxMinutesPerDay = input.hoursPerDay * 60;

  // 1. Validate max daily minutes
  for (const day of plan.days) {
    const totalMins = day.blocks.reduce((sum, b) => sum + b.minutes, 0);
    if (totalMins > maxMinutesPerDay) {
      throw new Error(
        `Plan validation error: Day ${day.date} has ${totalMins} mins scheduled, exceeding max limit of ${maxMinutesPerDay} mins.`
      );
    }
  }

  // 2. Validate syllabus unit coverage
  const scheduledTopics = new Set<string>();
  for (const day of plan.days) {
    for (const block of day.blocks) {
      scheduledTopics.add(block.topic.toLowerCase().trim());
    }
  }

  const droppedUnits = new Set(plan.dropped.map((d) => d.unit.toLowerCase().trim()));

  for (const unit of input.syllabusUnits) {
    const unitNormalized = unit.toLowerCase().trim();
    const isScheduled = Array.from(scheduledTopics).some(
      (t) => t.includes(unitNormalized) || unitNormalized.includes(t)
    );
    const isDropped = Array.from(droppedUnits).some(
      (d) => d.includes(unitNormalized) || unitNormalized.includes(d)
    );

    if (!isScheduled && !isDropped) {
      throw new Error(
        `Plan validation error: Syllabus unit "${unit}" neither appears in study blocks nor in the dropped list.`
      );
    }
  }
}
