import { z } from 'zod';
import { LLMGateway } from './gateway.js';
import { LLMValidationError } from './types.js';

async function runTests() {
  console.log('=== Running LLM Gateway Tests ===\n');

  // Test 1: Single repair retry on schema validation failure
  console.log('Test 1: Verification of 1 repair retry on schema failure...');
  const gateway = new LLMGateway();

  const testSchema = z.object({
    answer: z.string(),
    score: z.number(),
  });

  let callCount = 0;
  gateway.registerMockHandler('Test1SystemPrompt', async (userPrompt: string) => {
    callCount++;
    if (callCount === 1) {
      // First attempt returns invalid schema (score is a string instead of a number)
      return JSON.stringify({ answer: 'Valid Answer', score: 'not-a-number' });
    }
    // Second attempt returns valid schema
    return JSON.stringify({ answer: 'Valid Answer', score: 100 });
  });

  const result = await gateway.completeJSON(testSchema, {
    systemPrompt: 'Test1SystemPrompt',
    userPrompt: 'Give me a score',
    providerPriority: ['mock'],
    forceRefresh: true,
  });

  if (callCount !== 2) {
    throw new Error(`Expected exactly 2 attempts (1 initial + 1 retry), got ${callCount}`);
  }
  if (result.score !== 100) {
    throw new Error(`Expected score 100 after retry, got ${result.score}`);
  }
  console.log('✅ Test 1 PASSED: Successfully retried once and parsed valid JSON on repair.\n');

  // Test 2: Two consecutive schema failures throws LLMValidationError
  console.log('Test 2: Two consecutive schema failures throws LLMValidationError...');
  let callCount2 = 0;
  gateway.registerMockHandler('Test2SystemPrompt', async (userPrompt: string) => {
    callCount2++;
    // Always return invalid schema
    return JSON.stringify({ answer: 'Still Invalid', score: 'invalid' });
  });

  let threwCorrectError = false;
  try {
    await gateway.completeJSON(testSchema, {
      systemPrompt: 'Test2SystemPrompt',
      userPrompt: 'Give me a score',
      providerPriority: ['mock'],
      forceRefresh: true,
    });
  } catch (err: any) {
    if (err instanceof LLMValidationError) {
      threwCorrectError = true;
    } else {
      console.error('Unexpected error type:', err);
    }
  }

  if (callCount2 !== 2) {
    throw new Error(`Expected exactly 2 attempts before throwing typed error, got ${callCount2}`);
  }
  if (!threwCorrectError) {
    throw new Error('Expected LLMValidationError to be thrown after 2 failed attempts');
  }
  console.log('✅ Test 2 PASSED: Threw LLMValidationError after 1 repair retry failed.\n');

  // Test 3: Disk Caching
  console.log('Test 3: Verification of Disk Caching...');
  let mockCalls = 0;
  const uniquePrompt = `Cached Prompt ${Date.now()}`;
  gateway.registerMockHandler('Test3SystemPrompt', async () => {
    mockCalls++;
    return JSON.stringify({ answer: 'Cached Answer', score: 50 });
  });

  const run1 = await gateway.completeJSON(testSchema, {
    systemPrompt: 'Test3SystemPrompt',
    userPrompt: uniquePrompt,
    providerPriority: ['mock'],
  });

  const run2 = await gateway.completeJSON(testSchema, {
    systemPrompt: 'Test3SystemPrompt',
    userPrompt: uniquePrompt,
    providerPriority: ['mock'],
  });

  if (mockCalls !== 1) {
    throw new Error(`Expected 1 provider call for 2 completeJSON requests due to disk cache, got ${mockCalls}`);
  }
  if (JSON.stringify(run1) !== JSON.stringify(run2)) {
    throw new Error('Expected cached outputs to be byte-identical');
  }
  console.log('✅ Test 3 PASSED: Disk caching returns identical output and bypasses LLM call.\n');

  console.log('🎉 All LLM Gateway tests PASSED successfully!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
