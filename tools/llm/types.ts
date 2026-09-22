import { ZodSchema } from 'zod';

export type ProviderName = 'google' | 'groq' | 'cerebras' | 'openrouter' | 'mock';

export interface LLMCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  providerPriority?: ProviderName[];
  forceRefresh?: boolean;
  profile?: string;
}

export interface LLMReport {
  calls: number;
  cacheHits: number;
  providerMix: Record<ProviderName, number>;
  failures: number;
  wallTimeMs: number;
}

export class LLMError extends Error {
  constructor(message: string, public provider?: ProviderName, public cause?: unknown) {
    super(message);
    this.name = 'LLMError';
  }
}

export class LLMValidationError extends Error {
  constructor(message: string, public validationErrors: string, public rawResponse: string) {
    super(message);
    this.name = 'LLMValidationError';
  }
}

export interface AdapterConfig {
  name: ProviderName;
  model: string;
  baseUrl?: string;
  tokensPerMinute?: number;
  maxBucketSize?: number;
}
