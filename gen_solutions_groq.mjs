// gen_solutions_groq.mjs
// Run: node gen_solutions_groq.mjs
// Uses Groq (free, fast) to generate solutions

import fs from 'node:fs';
import path from 'node:path';

const PAPER_PATH = path.resolve('public/content/split-view-paper.json');
const API_KEY = process.env.GROQ_API_KEY;
const DELAY_MS = 10000;

if (!API_KEY) {
  console.error('ERROR: Set GROQ_API_KEY first');
  console.error('Get free key from: console.groq.com');
  process.exit(1);
}

const paper = JSON.parse(fs.readFileSync(PAPER_PATH, 'utf8'));
const items = paper.items;
console.log(`Loaded ${items.length} questions\n`);

function buildPrompt(item) {
  const marks = item.marks || 3;
  return `You are a CBSE Class 10 board examiner. Write a complete model answer for this question.

Subject: ${item.subject || 'Science'}
Chapter: ${item.chapter}
Marks: ${marks}
Question: ${item.body}

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "body": "Complete answer in markdown with formulas using $...$ for inline and $$...$$ for display math",
  "steps": [
    {"label": "Step 1: Title", "body": "Explanation with working"}
  ],
  "keyPoints": ["key revision point 1", "key revision point 2"],
  "markingBreakdown": [
    {"point": "what earns this mark", "marks": NUMBER}
  ],
  "diagramNote": "diagram description or empty string",
  "commonMistakes": ["common error students make"],
  "formulasUsed": ["formula 1", "formula 2"],
  "insufficient_context": false
}

RULES:
- markingBreakdown marks MUST sum to exactly ${marks}
- steps array must have ${marks <= 2 ? 2 : marks <= 3 ? 3 : 4} steps
- Use real CBSE Class 10 NCERT content, not generic text
- Include actual formulas relevant to ${item.chapter}`;
}

async function callGroq(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err.substring(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response');

  const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

let success = 0, failed = 0;

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  const start = Date.now();
  process.stdout.write(`[Q${String(i + 1).padStart(2, '0')}/${items.length}] ${item.chapter?.substring(0, 28).padEnd(28)} | ${item.marks}m | `);

  try {
    const solution = await callGroq(buildPrompt(item));

    // Fix marks sum if needed
    const sum = (solution.markingBreakdown || []).reduce((a, b) => a + (b.marks || 0), 0);
    if (solution.markingBreakdown && Math.abs(sum - item.marks) > 0.01) {
      const diff = item.marks - sum;
      solution.markingBreakdown[solution.markingBreakdown.length - 1].marks += diff;
    }

    items[i] = { ...item, explanation: solution };
    console.log(`groq | ${Date.now() - start}ms ✓`);
    success++;

    if (i < items.length - 1) await delay(DELAY_MS);

  } catch (err) {
    console.log(`FAILED | ${Date.now() - start}ms ✗ — ${err.message.substring(0, 100)}`);
    failed++;
    await delay(DELAY_MS);
  }
}

paper.items = items;
fs.writeFileSync(PAPER_PATH, JSON.stringify(paper, null, 2));

console.log(`\n✅ Done. Success: ${success}, Failed: ${failed}`);
console.log(`Saved: ${PAPER_PATH}`);
