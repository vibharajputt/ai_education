// src/core/aiClient.ts
// Live AI client — real AI calls happen server-side only (AGENTS.md).
//
// EXACTLY TWO live AI paths exist:
//   1. POST /api/assist        — SSE streaming: simplify, hindi, why, ask
//   2. POST /api/analyze-resume — Resume upload and critique
//
// Any other live AI call is a bug.

import type { Track } from './types';

export class RateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class GatewayError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'GatewayError';
    this.code = code;
  }
}

export interface AssistRequest {
  itemId: string;
  itemBody?: string;
  subject?: string;
  chapter?: string;
  track?: Track;
  mode?: 'simplify' | 'hindi' | 'why' | 'ask';
  question?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ExplainStreamChunk {
  delta: string;
  done: boolean;
  error?: { code: string; message: string };
}

/**
 * Calls POST /api/assist and streams SSE events as text deltas.
 */
export async function* explainItem(
  request: AssistRequest,
  signal?: AbortSignal,
): AsyncGenerator<ExplainStreamChunk> {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3001');
  try {
    const response = await fetch(`${apiBase}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: request.itemId,
        itemBody: request.itemBody,
        subject: request.subject,
        chapter: request.chapter,
        mode: request.mode ?? 'simplify',
        question: request.question,
        history: request.history ?? [],
      }),
      signal,
    });

    if (response.status === 429) {
      const errJson = await response.json().catch(() => ({}));
      const resetHeader = response.headers.get('X-RateLimit-Reset');
      const retryAfter =
        errJson?.error?.retryAfterSeconds ||
        (resetHeader ? parseInt(resetHeader, 10) : 60);
      throw new RateLimitError(
        errJson?.error?.message || `Rate limit exceeded. Please wait ${retryAfter}s.`,
        retryAfter,
      );
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new GatewayError(
        errJson?.error?.message || `Server error (${response.status})`,
        errJson?.error?.code || 'SERVER_ERROR',
      );
    }

    if (response.body) {
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
              if (data.error) {
                yield { delta: '', done: true, error: data.error };
                return;
              }
              yield { delta: data.delta || '', done: data.done || false, error: data.error };
              if (data.done) return;
            } catch {
              // Ignore malformed intermediate chunk
            }
          }
        }
      }
      return;
    }
  } catch (err: unknown) {
    if (signal?.aborted) return;
    if (err instanceof RateLimitError || err instanceof GatewayError) {
      throw err;
    }
    // Network disconnection or fetch failure
    throw new GatewayError(
      'Unable to connect to AI server. Please check your internet connection and try again.',
      'NETWORK_ERROR',
    );
  }
}

/**
 * Helper to collect full explanation stream into a single string.
 */
export async function explainItemFull(
  request: AssistRequest,
  signal?: AbortSignal,
): Promise<string> {
  let fullText = '';
  for await (const chunk of explainItem(request, signal)) {
    fullText += chunk.delta;
  }
  return fullText;
}

/**
 * Uploads a resume document (PDF/DOCX) to POST /api/analyze-resume for in-memory analysis.
 */
export async function analyzeResumeFile(
  file: File,
  jobDescription?: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3001');
  const formData = new FormData();
  formData.append('resume', file);
  if (jobDescription) {
    formData.append('jobDescription', jobDescription);
  }

  const response = await fetch(`${apiBase}/api/analyze-resume`, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `Resume analysis failed with status ${response.status}`);
  }

  return response.json();
}
