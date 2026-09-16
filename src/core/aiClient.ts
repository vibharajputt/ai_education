// src/core/aiClient.ts
// Live AI client — real AI calls happen server-side only (AGENTS.md).
//
// EXACTLY TWO live AI paths exist:
//   1. POST /api/explain        — "Explain this" on any ContentItem
//   2. POST /api/analyze-resume — Resume upload and critique
//
// Any other live AI call is a bug. If a feature seems to require a third path,
// stop and ask before implementing.

import type { Track } from './types';

export interface ExplainRequest {
  itemId: string;
  itemBody: string;
  track: Track;
}

export interface ExplainStreamChunk {
  delta: string;
  done: boolean;
}

/**
 * Calls POST /api/explain and streams the response as text deltas.
 * Uses the `explain` prompt template on the server.
 * In dev/demo when server is offline, provides a streaming fallback.
 */
export async function* explainItem(
  request: ExplainRequest,
  signal?: AbortSignal,
): AsyncGenerator<ExplainStreamChunk> {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  try {
    const response = await fetch(`${apiBase}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          yield { delta: '', done: true };
          break;
        }
        yield { delta: decoder.decode(value, { stream: true }), done: false };
      }
      return;
    }
  } catch {
    if (signal?.aborted) return;
  }

  // Graceful development stub fallback if live Express server is not yet running
  const mockChunks = [
    `### AI Explanation Walkthrough\n\n`,
    `**Track**: ${request.track.toUpperCase()}\n\n`,
    `#### 1. Concept Analysis\n`,
    `Breaking down the item prompt: "${request.itemBody.slice(0, 100)}..."\n\n`,
    `#### 2. Strategic Solution Path\n`,
    `- Identify the primary theoretical framework and governing formulas.\n`,
    `- Formulate the step-by-step mathematical or architectural progression.\n`,
    `- Verify edge cases and validate against standard marking criteria.\n\n`,
    `#### 3. Key Takeaway\n`,
    `Always write the general governing formula first before substituting specific values.`,
  ];

  for (const chunk of mockChunks) {
    if (signal?.aborted) return;
    yield { delta: chunk, done: false };
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  yield { delta: '', done: true };
}

/**
 * Helper to collect full explanation stream into a single string.
 */
export async function explainItemFull(
  request: ExplainRequest,
  signal?: AbortSignal,
): Promise<string> {
  let fullText = '';
  for await (const chunk of explainItem(request, signal)) {
    fullText += chunk.delta;
  }
  return fullText;
}
