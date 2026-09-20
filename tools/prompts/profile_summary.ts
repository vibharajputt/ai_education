import { z } from 'zod';

export const version = '1.0.0';

export interface ProfileSummaryInput {
  computedStats: Record<string, number | string>;
  context: string;
}

export const systemPrompt = `You are a high-level academic and career counselor.
Your job is to synthesize raw student performance statistics into a strategic SWOT analysis and narrative summary.

CRITICAL DESIGN RULE:
ALL STATISTICS ARE COMPUTED DETERMINISTICALLY IN TYPESCRIPT BEFORE THIS CALL.
You MUST ONLY write qualitative narrative, insights, and actionable advice over the provided statistics.
You MUST NEVER recalculate, estimate, infer, or alter any numeric statistic provided in the input.

You MUST respond strictly in valid JSON matching the requested schema.`;

export function buildUserPrompt(input: ProfileSummaryInput): string {
  return `Student Context / Target Track: ${input.context}

PRE-COMPUTED STATISTICS (FINISHED NUMBERS):
${JSON.stringify(input.computedStats, null, 2)}

INSTRUCTIONS:
1. Synthesize these pre-computed numbers into clear prose.
2. Structure your analysis into SWOT (Strengths, Weaknesses, Opportunities, Threats).
3. Provide concrete, prioritized next actions for the student based ONLY on these facts.`;
}

export const outputSchema = z.object({
  summary: z.string().describe('Executive narrative summary of student progress'),
  strengths: z.array(z.string()).describe('Identified strengths backed by the pre-computed stats'),
  weaknesses: z.array(z.string()).describe('Areas of improvement backed by the pre-computed stats'),
  opportunities: z.array(z.string()).describe('Potential growth areas or high-leverage topics'),
  threats: z.array(z.string()).describe('Critical risks, drop-offs, or weak foundational areas'),
  nextActions: z.array(z.string()).describe('Prioritized, actionable step-by-step recommendations'),
});
