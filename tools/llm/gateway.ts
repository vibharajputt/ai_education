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
  ) {}

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
    google: { name: 'google', model: 'gemini-1.5-flash' },
    groq: { name: 'groq', model: 'llama-3.3-70b-versatile' },
    cerebras: { name: 'cerebras', model: 'llama3.1-8b' },
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
      
      let responseText = "Here is a step-by-step breakdown based on the verified solution chunk:\n\n1. **Identify Given Values**: Note the key measurements and parameters provided in the problem.\n2. **Apply Core Principle**: Use the standard formula applicable to this topic.\n3. **Calculate Result**: Substitute the values carefully to arrive at the exact final answer.";

      if (options.systemPrompt.includes('"hindi"')) {
        responseText = "यह सत्यापित समाधान पर आधारित सरल व्याख्या है:\n\n1. **मुख्य नियम**: उत्तल लेंस $2f = 50\\text{ cm}$ पर वास्तविक एवं उल्टा प्रतिबिंब $50\\text{ cm}$ दूरी पर बनाता है।\n2. **फोकस दूरी**: $f = 25\\text{ cm} = 0.25\\text{ m}$।\n3. **क्षमता**: $P = +4.0\\text{ D}$ (डायोप्टर)।";
      } else if (options.systemPrompt.includes('"why"')) {
        responseText = "### Conceptual Rationale\n\n- **Sign Convention**: Distances measured in the direction of incident light are positive.\n- **Magnification Factor**: Equal size real image implies magnification $m = -1$.\n- **Power Relationship**: Power $P = 1/f$ is positive for converging (convex) lenses.";
      } else if (options.systemPrompt.includes('"simplify"')) {
        responseText = "### Simplified Step-by-Step\n\n1. **Understand the Setup**: A convex lens forms an image equal to object size when placed at $2f$.\n2. **Find Focal Length**: Since $2f = 50\\text{ cm}$, focal length $f = 25\\text{ cm} = 0.25\\text{ m}$.\n3. **Find Lens Power**: Power $P = 1 / 0.25 = +4.0\\text{ D}$.";
      }

      return JSON.stringify({ response: responseText });
    }

    const apiKey = this.keyRotator.getNextKey(provider);
    if (!apiKey) throw new LLMError(`No API key available for ${provider}`);

    const config = this.providerConfigs[provider];

    if (provider === 'google') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`;
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

      if (!res.ok) {
        const errText = await res.text();
        throw new LLMError(`Google Gemini API error ${res.status}: ${errText}`, provider);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new LLMError('Google Gemini response empty', provider);
      return text;
    }

    // OpenAI-Compatible Endpoints: Groq, Cerebras, OpenRouter
    const endpointMap: Record<string, string> = {
      groq: 'https://api.groq.com/openai/v1/chat/completions',
      cerebras: 'https://api.cerebras.ai/v1/chat/completions',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    };

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
