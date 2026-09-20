import fs from 'node:fs';
import path from 'node:path';
import { LLMGateway } from '../llm/gateway.js';
import * as explainPrompt from '../prompts/explain.js';
import { ContentItem } from '../../src/core/types.js';

export interface GenOptions {
  force?: boolean;
  limit?: number;
}

export async function generateExplanations(gateway: LLMGateway, options: GenOptions = {}) {
  console.log('--- Generating Explanations ---');

  const contentDir = path.resolve(process.cwd(), 'content');
  const targetFile = path.join(contentDir, 'explanations.json');

  let existing: any[] = [];
  if (fs.existsSync(targetFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  // Sample items to generate explanations for
  const sampleQuestions: ContentItem[] = [
    {
      id: 'q-cbse-10-phy-01',
      kind: 'question',
      track: 'school',
      subject: 'Physics',
      chapter: 'Light Reflection and Refraction',
      concepts: ['Snells Law', 'Refractive Index'],
      tags: ['cbse', 'class10', 'physics'],
      difficulty: 'medium',
      body: 'A convex lens forms a real and inverted image of a needle at a distance of 50 cm from it. Where is the needle placed in front of the convex lens if the image is equal to the size of the object? Also, find the power of the lens.',
      images: [],
      metadata: {},
      marks: 5,
    },
    {
      id: 'q-cbse-12-chem-01',
      kind: 'question',
      track: 'school',
      subject: 'Chemistry',
      chapter: 'Electrochemistry',
      concepts: ['Nernst Equation', 'EMF'],
      tags: ['cbse', 'class12', 'chemistry'],
      difficulty: 'hard',
      body: 'Calculate the emf of the cell in which the following reaction takes place: Mg(s) + 2Ag+(0.0001M) -> Mg2+(0.130M) + 2Ag(s). Given E°cell = 3.17 V.',
      images: [],
      metadata: {},
      marks: 3,
    },
  ];

  const itemsToProcess = options.limit ? sampleQuestions.slice(0, options.limit) : sampleQuestions;
  const resultMap = new Map<string, any>();

  // Load existing if not forcing
  if (!options.force) {
    for (const exp of existing) {
      if (exp.itemId) resultMap.set(exp.itemId, exp);
    }
  }

  const results: any[] = [];

  for (const item of itemsToProcess) {
    if (resultMap.has(item.id) && !options.force) {
      console.log(`[Cache/Resume] Skipping already generated explanation for ${item.id}`);
      results.push(resultMap.get(item.id));
      continue;
    }

    console.log(`[LLM] Generating explanation for ${item.id}...`);
    const input: explainPrompt.ExplainInput = {
      item,
      mode: 'solution',
      classLevel: item.track === 'school' ? 'Class 10-12 CBSE' : 'Undergraduate',
      marks: item.marks || 3,
      sourceChunks: [
        'Lens Formula: 1/f = 1/v - 1/u. Magnification m = v/u.',
        'Power of lens P = 1/f(in meters).',
        'Nernst equation: Ecell = E°cell - (0.0591/n) * log([Products]/[Reactants]).',
      ],
    };

    const promptText = explainPrompt.buildUserPrompt(input);
    const explanationData = await gateway.completeJSON(explainPrompt.outputSchema, {
      systemPrompt: explainPrompt.systemPrompt,
      userPrompt: promptText,
      forceRefresh: options.force,
    });

    const fullExplanation = {
      itemId: item.id,
      type: 'solution',
      body: explanationData.body,
      steps: explanationData.steps,
      keyPoints: explanationData.keyPoints,
      markingBreakdown: explanationData.markingBreakdown,
      diagramNote: explanationData.diagramNote,
      commonMistakes: explanationData.commonMistakes,
      sources: ['NCERT Official Textbook'],
      summary: explanationData.body.slice(0, 150) + '...',
      formulasUsed: explanationData.formulasUsed,
      insufficient_context: explanationData.insufficient_context,
    };

    resultMap.set(item.id, fullExplanation);
    results.push(fullExplanation);
  }

  fs.writeFileSync(targetFile, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`✅ Saved ${results.length} explanations to ${targetFile}`);
  return results;
}
