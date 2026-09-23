import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ZodSchema } from 'zod';
import {
  ProviderName,
  LLMCompletionOptions,
  LLMReport,
  LLMError,
  LLMValidationError,
  AdapterConfig,
} from './types.js';

// ---------------------------------------------------------------------------
// Helper: Token Bucket Rate Limiter
// ---------------------------------------------------------------------------
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private maxTokens: number = 30, private refillRatePerSec: number = 0.5) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    // Calculate wait time until 1 token is refilled
    const waitMs = Math.ceil(((1 - this.tokens) / this.refillRatePerSec) * 1000);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsedSec * this.refillRatePerSec);
    this.lastRefill = now;
  }
}

// ---------------------------------------------------------------------------
// Helper: Circuit Breaker
// ---------------------------------------------------------------------------
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF-OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastStateChange = Date.now();

  constructor(
    private failureThreshold: number = 3,
    private resetTimeoutMs: number = 30000
  ) { }

  canExecute(): boolean {
    if (this.state === 'CLOSED' || this.state === 'HALF-OPEN') {
      return true;
    }
    if (Date.now() - this.lastStateChange > this.resetTimeoutMs) {
      this.state = 'HALF-OPEN';
      this.lastStateChange = Date.now();
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.lastStateChange = Date.now();
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// ---------------------------------------------------------------------------
// Key Rotator
// ---------------------------------------------------------------------------
class KeyRotator {
  private indices: Map<ProviderName, number> = new Map();

  getKeys(provider: ProviderName): string[] {
    const envSingle = process.env[`${provider.toUpperCase()}_API_KEY`];
    const envPlural = process.env[`${provider.toUpperCase()}_API_KEYS`];

    const keys: string[] = [];
    if (envSingle && envSingle.trim()) {
      keys.push(envSingle.trim());
    }
    if (provider === 'google' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      keys.push(process.env.GEMINI_API_KEY.trim());
    }
    if (provider === 'google' && process.env.VITE_GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY.trim()) {
      keys.push(process.env.VITE_GEMINI_API_KEY.trim());
    }
    if (envPlural && envPlural.trim()) {
      const splitKeys = envPlural.split(',').map((k) => k.trim()).filter(Boolean);
      keys.push(...splitKeys);
    }

    // Deduplicate
    return Array.from(new Set(keys));
  }

  getNextKey(provider: ProviderName): string | null {
    const keys = this.getKeys(provider);
    if (keys.length === 0) return null;

    const currentIndex = this.indices.get(provider) || 0;
    const key = keys[currentIndex % keys.length];
    this.indices.set(provider, (currentIndex + 1) % keys.length);
    return key;
  }
}

// ---------------------------------------------------------------------------
// LLM Gateway
// ---------------------------------------------------------------------------
export class LLMGateway {
  private cacheDir: string;
  private startTime: number;
  private keyRotator = new KeyRotator();

  private rateLimiters: Map<ProviderName, TokenBucket> = new Map();
  private circuitBreakers: Map<ProviderName, CircuitBreaker> = new Map();
  private mockHandlers: Map<string, (prompt: string) => Promise<string>> = new Map();

  private reportData: LLMReport = {
    calls: 0,
    cacheHits: 0,
    providerMix: { google: 0, groq: 0, cerebras: 0, openrouter: 0, mock: 0 },
    failures: 0,
    wallTimeMs: 0,
  };

  private providerConfigs: Record<ProviderName, AdapterConfig> = {
    google: { name: 'google', model: 'gemini-2.5-flash' },
    groq: { name: 'groq', model: 'openai/gpt-oss-120b' },
    cerebras: { name: 'cerebras', model: 'llama3-8b-8192' },
    openrouter: { name: 'openrouter', model: 'google/gemini-2.0-flash-001' },
    mock: { name: 'mock', model: 'mock-model' },
  };

  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir || path.resolve(process.cwd(), 'tools', '.cache', 'llm');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    this.startTime = Date.now();

    // Initialize rate limiters and circuit breakers for each provider
    const providers: ProviderName[] = ['google', 'groq', 'cerebras', 'openrouter', 'mock'];
    for (const p of providers) {
      this.rateLimiters.set(p, new TokenBucket(20, 0.5));
      this.circuitBreakers.set(p, new CircuitBreaker(3, 30000));
    }
  }

  /**
   * Register a custom mock handler for testing or deterministic output.
   */
  registerMockHandler(name: string, handler: (prompt: string) => Promise<string>): void {
    this.mockHandlers.set(name, handler);
  }

  /**
   * Primary entrypoint: Completes prompt and validates output against a Zod schema.
   * Strips fences, validates, retries ONCE on failure with validation error appended.
   */
  async completeJSON<T>(
    schema: ZodSchema<T>,
    options: LLMCompletionOptions
  ): Promise<T> {
    const cacheKey = this.getCacheKey(options);
    const cached = this.readFromCache(cacheKey);

    if (cached && !options.forceRefresh) {
      this.reportData.cacheHits += 1;
      const parsed = this.cleanAndParseJSON(cached);
      return schema.parse(parsed);
    }

    // Attempt 1
    let rawResponse = '';
    try {
      rawResponse = await this.executeWithFailover(options);
      const cleaned = this.cleanAndParseJSON(rawResponse);
      const validated = schema.parse(cleaned);

      // Save to cache on successful validation
      this.writeToCache(cacheKey, rawResponse);
      return validated;
    } catch (firstError: any) {
      // If error is raw LLM provider error (e.g. no keys available), rethrow immediately
      if (firstError instanceof LLMError && firstError.message.includes('No available provider')) {
        throw firstError;
      }

      const validationErrMsg = firstError.message || String(firstError);
      // Retry ONCE with validation error appended
      const retryUserPrompt = `${options.userPrompt}\n\n[CRITICAL NOTICE - PREVIOUS ATTEMPT FAILED SCHEMA VALIDATION]\nYour previous output failed validation with the following error:\n${validationErrMsg}\nPlease fix all format/schema issues and return strictly valid JSON.`;

      try {
        const retryOptions = { ...options, userPrompt: retryUserPrompt, forceRefresh: true };
        rawResponse = await this.executeWithFailover(retryOptions);
        const cleaned = this.cleanAndParseJSON(rawResponse);
        const validated = schema.parse(cleaned);

        this.writeToCache(cacheKey, rawResponse);
        return validated;
      } catch (secondError: any) {
        throw new LLMValidationError(
          `Failed schema validation after 1 repair retry: ${secondError.message || String(secondError)}`,
          secondError.message || String(secondError),
          rawResponse
        );
      }
    }
  }

  /**
   * Executes prompt across providers with rate limiting, circuit breaker, failover, exponential backoff.
   */
  private async executeWithFailover(options: LLMCompletionOptions): Promise<string> {
    const priority = options.providerPriority || ['google', 'groq', 'cerebras', 'openrouter', 'mock'];

    for (const provider of priority) {
      const circuitBreaker = this.circuitBreakers.get(provider)!;
      if (!circuitBreaker.canExecute()) {
        continue;
      }

      // Check key availability unless it's mock
      if (provider !== 'mock') {
        const key = this.keyRotator.getNextKey(provider);
        if (!key) {
          continue; // Skip provider if no API keys are set
        }
      }

      // Acquire rate limit token
      const rateLimiter = this.rateLimiters.get(provider)!;
      await rateLimiter.acquire();

      try {
        const responseText = await this.callProviderWithBackoff(provider, options);
        circuitBreaker.recordSuccess();
        this.reportData.calls += 1;
        this.reportData.providerMix[provider] += 1;
        return responseText;
      } catch (err: any) {
        this.reportData.failures += 1;
        circuitBreaker.recordFailure();
        // Continue loop to failover to next provider
      }
    }

    throw new LLMError('No available provider succeeded in generating a response.');
  }

  /**
   * Retries a single provider call with exponential backoff & jitter.
   */
  private async callProviderWithBackoff(
    provider: ProviderName,
    options: LLMCompletionOptions,
    maxRetries = 2
  ): Promise<string> {
    let attempt = 0;
    let delay = 500;

    while (attempt <= maxRetries) {
      try {
        return await this.callProviderApi(provider, options);
      } catch (err) {
        attempt += 1;
        if (attempt > maxRetries) throw err;
        const jitter = Math.random() * 200;
        await new Promise((res) => setTimeout(res, delay + jitter));
        delay *= 2;
      }
    }
    throw new LLMError(`Provider ${provider} failed after retries`);
  }

  /**
   * Provider specific API call implementation.
   */
  private async callProviderApi(
    provider: ProviderName,
    options: LLMCompletionOptions
  ): Promise<string> {
    if (provider === 'mock') {
      const mockKey = options.systemPrompt.slice(0, 50);
      const handler = this.mockHandlers.get(mockKey) || this.mockHandlers.get('default');
      if (handler) {
        return await handler(options.userPrompt);
      }

      // Context-aware dynamic fallback generator: extracts text from options.userPrompt
      const promptText = options.userPrompt;
      let topic = 'Concept';
      let bodyText = promptText;

      const bodyMatch = promptText.match(/\[Question Body\]:\s*([^\n]+)/);
      if (bodyMatch) {
        bodyText = bodyMatch[1].replace(/[*#]/g, '').trim();
      }
      const chapterMatch = promptText.match(/\[Chapter\]:\s*([^\n]+)/);
      if (chapterMatch) {
        topic = chapterMatch[1].trim();
      }

      let responseText = `### 💡 Step-by-Step Educational Breakdown (${topic})\n\n1. **Core Concept Principle:**\n   - **Topic:** ${topic}\n   - **Context:** ${bodyText.slice(0, 180)}...\n\n2. **Detailed Analysis:**\n   - Apply the governing scientific relations and memory anchors systematically.\n   - Ensure all parameters and units are aligned with CBSE board criteria.\n\n3. **Key Exam Takeaway:**\n   - Always state the standard definitions and formulas clearly to secure maximum step marks!`;

      if (options.systemPrompt.includes('"hindi"')) {
        responseText = `### 🇮🇳 Step-by-Step Hinglish Explanation (${topic})\n\n1. **Core Concept:**\n   - Is topic (**${topic}**) me: ${bodyText.slice(0, 160)}...\n\n2. **Kaise Solve / Yaad Karein:**\n   - Diye gaye values ko note karein aur governing formula apply karein.\n   - Steps ko step-by-step likhein taaki board exam me full marks milein.\n\n3. **Key Tip:** Unit aur formula zaroor mention karein!`;
      }

      return JSON.stringify({ response: responseText });
    }

    const apiKey = this.keyRotator.getNextKey(provider);
    if (!apiKey) throw new LLMError(`No API key available for ${provider}`);

    if (provider === 'google') {
      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
      ];

      for (const modelName of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const payload = {
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${options.systemPrompt}\n\n${options.userPrompt}` },
                ],
              },
            ],
            generationConfig: {
              temperature: options.temperature ?? 0.2,
              maxOutputTokens: options.maxTokens ?? 4096,
              responseMimeType: 'application/json',
            },
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
          }
        } catch {
          // Try next candidate model
        }
      }

      throw new LLMError('All Google Gemini candidate models failed', provider);
    }

    // OpenAI-Compatible Endpoints: Groq, Cerebras, OpenRouter
    const endpointMap: Record<string, string> = {
      groq: 'https://api.groq.com/openai/v1/chat/completions',
      cerebras: 'https://api.cerebras.ai/v1/chat/completions',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    };

    const config = this.providerConfigs[provider];
    const url = endpointMap[provider];
    const payload = {
      model: config.model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 4096,
      response_format: { type: 'json_object' },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://ai-education.local';
      headers['X-Title'] = 'AI Education Offline Generator';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new LLMError(`${provider} API error ${res.status}: ${errText}`, provider);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new LLMError(`${provider} response empty`, provider);
    return text;
  }

  /**
   * Helper to strip markdown code blocks and parse JSON.
   */
  private cleanAndParseJSON(raw: string): unknown {
    let clean = raw.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    return JSON.parse(clean);
  }

  /**
   * Disk cache helpers.
   */
  private getCacheKey(options: LLMCompletionOptions): string {
    const data = JSON.stringify({
      system: options.systemPrompt,
      user: options.userPrompt,
      temp: options.temperature ?? 0.2,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private readFromCache(cacheKey: string): string | null {
    const filePath = path.join(this.cacheDir, `${cacheKey}.json`);
    if (fs.existsSync(filePath)) {
      try {
        return fs.readFileSync(filePath, 'utf-8');
      } catch {
        return null;
      }
    }
    return null;
  }

  private writeToCache(cacheKey: string, content: string): void {
    const filePath = path.join(this.cacheDir, `${cacheKey}.json`);
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch {
      // Ignore cache write errors
    }
  }

  /**
   * Returns per-run telemetry and metrics report.
   */
  getReport(): LLMReport {
    return {
      ...this.reportData,
      wallTimeMs: Date.now() - this.startTime,
    };
  }
}