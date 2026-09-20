import { z } from 'zod';

export const version = '1.0.0';

export interface ExplainInput {
  item: {
    id?: string;
    body: string;
    subject?: string;
    chapter?: string;
    kind?: string;
    marks?: number;
  } | string;
  sourceChunks?: string[];
  mode: 'solution' | 'simplify' | 'hindi' | 'viva';
  classLevel: string;
  marks: number;
}

export const systemPrompt = `You are a CBSE board examiner and subject teacher with 20+ years of grading experience.
Your goal is to write step-by-step answers that earn full marks according to CBSE marking schemes, not verbose essays.

CRITICAL INSTRUCTIONS:
1. Scope Limit: NEVER introduce a concept outside the stated class syllabus level. Stick strictly to NCERT / CBSE curriculum standards for the specified class level.
2. Context Fidelity: Base your answer strictly on the provided source material. If the provided source material is insufficient to answer accurately, set "insufficient_context": true in your JSON output instead of hallucinating or filling gaps from memory.
3. Marking Scheme Precision: Sum of marks in "markingBreakdown" MUST EXACTLY EQUAL the question's allocated marks.
4. Numerical & Formula Traceability: Every numeric value must be directly traceable to the source material or derived explicitly in a shown step.
5. Mode Constraints:
   - "solution": Standard CBSE step-by-step model answer with formulas, steps, and marking scheme.
   - "simplify": Break down complex concepts into intuitive, easy-to-understand explanations suitable for revision.
   - "hindi": Translate and simplify into clear Hindi / Hinglish for student understanding. CRITICAL RULE FOR HINDI MODE: Change NO number, NO unit, NO formula, and NO final numerical answer!
   - "viva": Framing crisp, punchy viva-voce questions, core concepts, and key definitions.

You MUST respond strictly in valid JSON matching the requested schema.`;

export function buildUserPrompt(input: ExplainInput): string {
  const itemText = typeof input.item === 'string' ? input.item : JSON.stringify(input.item, null, 2);
  const sources = input.sourceChunks && input.sourceChunks.length > 0
    ? input.sourceChunks.map((chunk, i) => `[Source ${i + 1}]: ${chunk}`).join('\n\n')
    : 'No additional source chunks provided.';

  return `Class Level: ${input.classLevel}
Mode: ${input.mode}
Allocated Marks: ${input.marks}

QUESTION / ITEM:
${itemText}

SOURCE MATERIAL:
${sources}

HARD MANDATES:
1. Output JSON matching the schema.
2. Set insufficient_context = true if source material is lacking.
3. Ensure sum(markingBreakdown.marks) === ${input.marks}.
4. Mode "${input.mode}": ${input.mode === 'hindi' ? 'Translate to Hindi/Hinglish but keep ALL numbers, units, formulas and final answers IDENTICAL.' : 'Format according to standard guidelines.'}`;
}

export const outputSchema = z.object({
  body: z.string().describe('Full answer body / summary markdown'),
  steps: z.array(
    z.object({
      label: z.string().describe('Step title or label, e.g. Step 1: Formula'),
      body: z.string().describe('Step explanation and mathematical working'),
    })
  ),
  keyPoints: z.array(z.string()).describe('Key takeaways for quick revision'),
  markingBreakdown: z.array(
    z.object({
      point: z.string().describe('Criterion or step description'),
      marks: z.number().describe('Marks assigned to this point'),
    })
  ).describe('Marking scheme breakdown'),
  diagramNote: z.string().optional().describe('Note on diagram if required'),
  commonMistakes: z.array(z.string()).describe('Common student mistakes to avoid'),
  formulasUsed: z.array(z.string()).describe('List of formulas used in the solution'),
  insufficient_context: z.boolean().describe('True if source material was insufficient'),
});
