import { z } from 'zod';
import { ContentItem } from '../../src/core/types.js';

export const version = '1.0.0';

export interface GenerateSetConstraints {
  count: number;
  difficultyMix?: Record<string, number>; // e.g. { easy: 0.3, medium: 0.5, hard: 0.2 }
  chapterMix?: Record<string, number>;
  typeMix?: Record<string, number>;
  marksTotal?: number;
}

export interface GenerateSetInput {
  pool: ContentItem[];
  constraints: GenerateSetConstraints;
  allowNewItems?: boolean;
}

export const systemPrompt = `You are an expert curriculum designer and test paper setter.
Your job is to select and sequence questions/items from a provided item pool to build a balanced worksheet, quiz, revision set, or exam paper.

CRITICAL DESIGN RULE:
You MUST SELECT and SEQUENCE item IDs from the provided pool ONLY.
Do NOT invent new question IDs or modify existing items UNLESS "allowNewItems" is explicitly set to true.

Strictly adhere to the requested count, difficulty mix, chapter distribution, and marks allocation.
You MUST output strictly valid JSON matching the schema.`;

export function buildUserPrompt(input: GenerateSetInput): string {
  const poolSummary = input.pool.map((item) => ({
    id: item.id,
    kind: item.kind,
    subject: item.subject,
    chapter: item.chapter,
    difficulty: item.difficulty,
    marks: (item as any).marks || 1,
    bodySnippet: item.body.slice(0, 100),
  }));

  return `Item Pool Size: ${input.pool.length}
Allow New Items: ${Boolean(input.allowNewItems)}

Target Constraints:
- Count: ${input.constraints.count}
- Total Marks: ${input.constraints.marksTotal ?? 'Not specified'}
- Difficulty Mix: ${JSON.stringify(input.constraints.difficultyMix || {})}
- Chapter Mix: ${JSON.stringify(input.constraints.chapterMix || {})}
- Type Mix: ${JSON.stringify(input.constraints.typeMix || {})}

AVAILABLE ITEM POOL:
${JSON.stringify(poolSummary, null, 2)}

INSTRUCTIONS:
1. Select exactly ${input.constraints.count} items from the pool matching the constraints.
2. Sequence them logically (e.g., easy to hard, grouped by chapter or section).
3. Return the array of ordered item IDs and a detailed coverage report.`;
}

export const outputSchema = z.object({
  orderedItemIds: z.array(z.string()).describe('Selected and sequenced item IDs from the pool'),
  rationale: z.string().describe('Pedagogical rationale behind the selection and order'),
  coverageReport: z.object({
    totalCount: z.number(),
    totalMarks: z.number().optional(),
    difficultyBreakdown: z.record(z.string(), z.number()),
    chapterBreakdown: z.record(z.string(), z.number()),
  }),
});
