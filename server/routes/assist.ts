import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { LLMGateway } from '../../tools/llm/gateway.js';
import { loadItemContext } from '../utils/contentLoader.js';
import { assertNumericsPreserved } from '../utils/numericChecker.js';

export const assistRouter = Router();

const AssistInputSchema = z.object({
  itemId: z.string().min(1),
  itemBody: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  explanationId: z.string().optional(),
  mode: z.enum(['simplify', 'hindi', 'why', 'ask']),
  question: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .default([]),
});

const gateway = new LLMGateway();

// Off-scope topic detector helper
function isOffTopic(question: string, chapter?: string, subject?: string): boolean {
  if (!question || question.trim().length === 0) return false;
  const lowerQ = question.toLowerCase();
  const offTopicKeywords = ['weather', 'movie', 'recipe', 'bake', 'football', 'cricket', 'politics', 'election', 'song'];
  for (const kw of offTopicKeywords) {
    if (lowerQ.includes(kw)) return true;
  }
  return false;
}

assistRouter.post('/api/assist', async (req: Request, res: Response): Promise<any> => {
  const parseResult = AssistInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid request payload format',
        details: parseResult.error.format(),
      },
    });
  }

  const { itemId, itemBody, subject, chapter, explanationId, mode, question, history } = parseResult.data;

  // 1. Thread Turn Limit Check (Max 6 turns)
  if (history && history.length >= 6) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const msg = 'You have reached the maximum limit of 6 turns for this discussion thread. Please start a fresh thread for new questions.';
    res.write(`data: ${JSON.stringify({ delta: msg })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  // 2. Load Item Context strictly from content/ and public/content/ with fallback
  const context = loadItemContext(itemId, explanationId, {
    body: itemBody,
    subject,
    chapter,
  });

  if (!context) {
    return res.status(404).json({
      error: {
        code: 'ITEM_NOT_FOUND',
        message: `Content item "${itemId}" was not found in verified content bank.`,
      },
    });
  }

  // 3. Off-Scope Bounded Refusal Check
  if (question && isOffTopic(question, context.item.chapter, context.item.subject)) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const refusal = `I am strictly specialized in explaining this problem (${context.item.chapter || ''} - ${context.item.subject || ''}). Please ask a question related to this specific topic.`;
    res.write(`data: ${JSON.stringify({ delta: refusal })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  // 4. Build Strictly Bounded System & User Prompts
  const hindiModeInstruction = mode === 'hindi'
    ? `- "hindi": Respond in natural, friendly **Hinglish** (conversational Hindi written in English script mixed with English terms). \
Example style: "Dekho is question/concept mein sabse pehle main principle note karte hain...". \
Break the solution down step-by-step. MANDATORY: Preserve EVERY numeric value, unit, and formula exactly as written in the source.`
    : `- "hindi": Translate into clear Hindi/Hinglish. MANDATORY: Preserve EVERY numeric value, unit, and formula from the original text!`;

  const systemPrompt = `You are a dedicated senior CBSE teacher assisting a student with a specific problem or concept.
CRITICAL BOUNDARY MANDATES:
1. STRICT CONTEXT LIMIT: Your knowledge is strictly focused on the provided Item context and details below.
2. Mode "${mode}":
   - "simplify": Provide a crystal clear, step-by-step educational breakdown and explanation of this exact item.
   ${hindiModeInstruction}
   - "why": Explain the conceptual rationale and scientific reasoning behind this concept.
   - "ask": Answer the student's specific question based on this topic.
3. Use clean Markdown with LaTeX math ($...$ or $$...$$) for formulas.`;

  const userPrompt = `SOURCE CONTEXT:
${context.sourceChunks.join('\n\n')}

${question ? `STUDENT QUESTION:\n${question}` : `REQUEST MODE: ${mode}`}

Please provide a clear, step-by-step educational response for this specific item. Return JSON matching: { "response": "string" }`;

  const assistSchema = z.object({ response: z.string() });

  try {
    let responseObj = await gateway.completeJSON(assistSchema, {
      systemPrompt,
      userPrompt,
      forceRefresh: Boolean(question),
    });

    let finalResponseText = responseObj.response;

    // 5. Hindi Mode Numeric Preservation Assertion & Retry
    if (mode === 'hindi') {
      const sourceText = context.sourceChunks.join(' ');
      let check = assertNumericsPreserved(sourceText, finalResponseText);

      if (!check.preserved && check.missingNumerics.length > 0) {
        const missingList = check.missingNumerics.join(', ');
        const retryUserPrompt = `${userPrompt}\n\n[CRITICAL NOTICE]: Your previous Hindi translation omitted/modified the following values: ${missingList}. You MUST include every number (${missingList}) exactly as written!`;

        try {
          responseObj = await gateway.completeJSON(assistSchema, {
            systemPrompt,
            userPrompt: retryUserPrompt,
            forceRefresh: true,
          });
          finalResponseText = responseObj.response;
        } catch {
          // Use original response if retry fails
        }
      }
    }

    // 6. Stream Response via SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const words = finalResponseText.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ delta: word + ' ' })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    return res.status(500).json({
      error: {
        code: 'GATEWAY_ERROR',
        message: 'The AI Assistant is currently unavailable. Please try again later.',
      },
    });
  }
});
