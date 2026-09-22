// server/routes/geminiExplain.ts
// POST /api/gemini-explain — server-side Gemini proxy.
// Reads GEMINI_API_KEY from process.env (no VITE_ prefix) so the key is
// never included in the browser bundle. Mirrors the candidate model list,
// fallback behaviour, and cleanAiOutput from the original geminiService.ts.

import { Request, Response, Router } from 'express';
import { z } from 'zod';

export const geminiExplainRouter = Router();

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const GeminiExplainSchema = z.object({
  questionText: z.string().min(1),
  subject: z.string(),
  chapter: z.string(),
  marks: z.number().optional(),
  modelAnswer: z.string().optional(),
  mode: z.enum(['hinglish', 'example', 'steps', 'pitfalls', 'ask', 'simplify', 'hindi', 'why']),
  userPrompt: z.string().optional(),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(z.object({ text: z.string() })),
      })
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Candidate models — kept in sync with the original geminiService.ts list
// ---------------------------------------------------------------------------
const CANDIDATE_MODELS = [
  'models/gemini-3.6-flash',
  'models/gemini-2.5-flash',
  'models/gemma-4-31b-it',
  'models/gemini-flash-latest',
];

// ---------------------------------------------------------------------------
// cleanAiOutput — identical to the function in geminiService.ts
// ---------------------------------------------------------------------------
function cleanAiOutput(text: string): string {
  if (text.includes('*   *Greeting:*') || text.includes('*   *The Science')) {
    const parts = text.split(/\n\s*\*\s+\*Greeting:\*\s*/i);
    if (parts.length > 1) {
      return parts[1].replace(/^\s*"/, '').replace(/"\s*$/, '');
    }
  }
  return text;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
geminiExplainRouter.post('/api/gemini-explain', async (req: Request, res: Response): Promise<any> => {
  const parseResult = GeminiExplainSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid request payload.',
        details: parseResult.error.format(),
      },
    });
  }

  const { questionText, subject, chapter, marks, modelAnswer, mode, userPrompt } = parseResult.data;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim().length === 0) {
    const GROQ_KEY = process.env.GROQ_API_KEY || '';
    if (GROQ_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [{ role: 'user', content: `${systemInstruction}\n\n${promptContent}` }],
            temperature: 0.4, max_tokens: 1024
          })
        });
        if (groqRes.ok) {
          const gd = await groqRes.json() as any;
          const gt = gd?.choices?.[0]?.message?.content;
          if (gt) return res.status(200).json({ text: gt.trim() });
        }
      } catch {}
    }
    return res.status(503).json({ error: { code: 'NO_API_KEY', message: 'No AI key configured.' } });
  }

  // Build system instruction — identical logic to geminiService.ts
  let systemInstruction = `You are a top CBSE Senior Board Evaluator and Master Teacher in ${subject} for Class 10 & 12.\nProvide a clear, accurate, and structured response using LaTeX formatting for all formulas ($...$ or $$...$$).`;

  if (mode === 'hinglish' || mode === 'hindi') {
    systemInstruction += `\nTask: Explain the solution to this specific question in natural, friendly **Hinglish** (conversational Hindi in English script + English terms).\nExample style: "Dekho is question me sabse pehle given parameters note karte hain... Ab is formula me values put karenge..."\nBreak it down step-by-step so any student can understand instantly.`;
  } else if (mode === 'example') {
    systemInstruction += `\nTask: Explain the fundamental concept of this question using **vivid, practical real-world daily life examples and analogies** (e.g., household items, sports, vehicles, cooking, water flow, sunlight).\nConnect the intuition directly to solving this exact CBSE problem.`;
  } else if (mode === 'steps' || mode === 'simplify') {
    systemInstruction += `\nTask: Provide an exact **CBSE Step-Wise Mark Distribution Breakdown** for this question (${marks ? marks + ' Marks' : ''}).\nLabel each step with allocated marks:\n- [Step 1: Formula / Law Statement] (+Marks)\n- [Step 2: Substitution of Given Data] (+Marks)\n- [Step 3: Algebraic / Chemical Derivation] (+Marks)\n- [Step 4: Boxed Final Answer with Proper S.I. Units] (+Marks)`;
  } else if (mode === 'pitfalls') {
    systemInstruction += `\nTask: Identify the **Common Mistakes & Examiner Traps** for this exact question.\nExplain where CBSE evaluators cut marks (e.g. missing units, wrong sign conventions, omitting intermediate steps).`;
  } else {
    systemInstruction += `\nTask: Answer the student's doubt directly regarding this CBSE problem.\nIf the student asks "example se samjhao", give real world examples.\nIf the student asks "Hinglish me", answer in clear Hinglish.\nBe concise, clear, and encouraging.`;
  }

  const promptContent = `
[CONTEXT]
Subject: ${subject}
Chapter: ${chapter}
Question (${marks ? marks + ' Marks' : ''}):
${questionText}

${modelAnswer ? `[CBSE Official Solution Reference]:\n${modelAnswer}\n` : ''}
[STUDENT QUERY / INSTRUCTION]:
${userPrompt || (mode === 'hinglish' ? 'Is question ko step-by-step Hinglish me explain karo.' : mode === 'example' ? 'Is concept ko ek practical real-life example ke saath samjhao.' : 'Please provide a detailed step solution.')}
`;

  // Try each candidate model in order, return first successful response
  for (const model of CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${promptContent}` }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      };

      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (apiRes.ok) {
        const data = await apiRes.json() as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText && generatedText.trim().length > 0) {
          return res.status(200).json({ text: cleanAiOutput(generatedText.trim()) });
        }
      }
    } catch (err) {
      console.warn(`[gemini-explain] Model ${model} failed, trying next...`, err);
    }
  }

  // All models exhausted — signal client to use fallback
  return res.status(502).json({
    error: {
      code: 'ALL_MODELS_FAILED',
      message: 'All Gemini candidate models failed. Client should render fallback.',
    },
  });
});
