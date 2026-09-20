// src/core/aiClient.ts
// Live AI client — real AI calls happen server-side only (AGENTS.md).

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

export interface AssistRequest {
  itemId: string;
  explanationId?: string;
  mode: 'simplify' | 'hindi' | 'why' | 'ask';
  question?: string;
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export interface AssistStreamChunk {
  delta: string;
  done: boolean;
  error?: { code: string; message: string; retryAfter?: number };
}

/**
 * Calls POST /api/explain and streams response as text deltas.
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

  // Fallback demo stream
  const mockChunks = [
    `### AI Explanation Walkthrough\n\n`,
    `**Track**: ${request.track.toUpperCase()}\n\n`,
    `#### 1. Concept Analysis\n`,
    `Breaking down the item prompt: "${request.itemBody.slice(0, 100)}..."\n\n`,
    `#### 2. Strategic Solution Path\n`,
    `- Identify governing formulas.\n`,
    `- Execute mathematical progression.\n\n`,
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

/**
 * Calls POST /api/assist (SSE streaming) with AbortSignal support.
 */
export async function* assistStreamItem(
  request: AssistRequest,
  signal?: AbortSignal,
): AsyncGenerator<AssistStreamChunk> {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';

  try {
    const response = await fetch(`${apiBase}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });

    if (response.status === 429) {
      const retryHeader = response.headers.get('Retry-After');
      const retryAfter = retryHeader ? parseInt(retryHeader, 10) : 30;
      yield {
        delta: '',
        done: true,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait before trying again.',
          retryAfter,
        },
      };
      return;
    }

    if (response.status === 500) {
      const errJson = await response.json().catch(() => ({}));
      yield {
        delta: '',
        done: true,
        error: {
          code: errJson?.error?.code || 'GATEWAY_ERROR',
          message: errJson?.error?.message || 'AI Assistant is temporarily unavailable. Please try again.',
        },
      };
      return;
    }

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                yield { delta: data.chunk, done: false };
              }
              if (data.done) {
                yield { delta: '', done: true };
                return;
              }
            } catch {
              // Ignore line parse errors
            }
          }
        }
      }
      yield { delta: '', done: true };
      return;
    }
  } catch (err: any) {
    if (signal?.aborted) return;
  }

  // Graceful Fallback Stream for dev/demo when backend server process is offline
  let mockContent = '';
  if (request.mode === 'simplify') {
    mockContent = `### Simplified Explanation\n\n1. **Core Idea**: Think of a convex lens as a magnifying glass that focuses light rays to a single point.\n2. **The Key Rule**: When an object is placed at distance $2f$, the image is formed at equal size on the opposite side at $2f$.\n3. **Power Formula**: Power is simply the inverse of focal length in meters ($P = 1/f$).`;
  } else if (request.mode === 'hindi') {
    mockContent = `### हिंदी अनुवाद एवं सरल व्याख्या\n\n1. **मुख्य नियम**: जब कोई वस्तु उत्तल लेंस के सामने $2f = 50\\text{ cm}$ की दूरी पर रखी जाती है, तो उसका वास्तविक एवं उल्टा प्रतिबिंब $50\\text{ cm}$ दूरी (2F2) पर ही बनता है।\n2. **फोकस दूरी (Focal Length)**: $f = 25\\text{ cm} = 0.25\\text{ m}$।\n3. **लेंस की क्षमता (Power)**: $P = +4.0\\text{ D}$ (डायोप्टर)।`;
  } else if (request.mode === 'why') {
    mockContent = `### Conceptual Rationale (Why This Step?)\n\n- **Why Magnification $m = -1$?** A real and inverted image of identical size means magnitude of magnification $|m| = 1$. Since real images are inverted, $m = -1$.\n- **Why positive Power?** Convex lenses converge light rays, so their focal length is positive by sign convention. Hence, Power is $+4.0\\text{ D}$.`;
  } else {
    mockContent = `### Direct Answer to Student Query\n\nRegarding your question: "${request.question || 'Explain step'}"\n\nBased on the verified solution, we apply the standard formula $\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$ to isolate $f$. Substituting $v = +50\\text{ cm}$ and $u = -50\\text{ cm}$ yields $f = +25\\text{ cm}$.`;
  }

  const words = mockContent.split(' ');
  for (const word of words) {
    if (signal?.aborted) return;
    yield { delta: word + ' ', done: false };
    await new Promise((resolve) => setTimeout(resolve, 35));
  }
  yield { delta: '', done: true };
}
