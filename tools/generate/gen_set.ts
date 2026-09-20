import fs from 'node:fs';
import path from 'node:path';
import { LLMGateway } from '../llm/gateway.js';
import * as setPrompt from '../prompts/generate_set.js';
import { ContentItem } from '../../src/core/types.js';

export interface GenOptions {
  force?: boolean;
  limit?: number;
}

export async function generateSets(gateway: LLMGateway, options: GenOptions = {}) {
  console.log('--- Generating Question Sets & Worksheets ---');

  const contentDir = path.resolve(process.cwd(), 'content');
  const targetFile = path.join(contentDir, 'sets.json');

  const pool: ContentItem[] = [
    {
      id: 'q-phy-01',
      kind: 'question',
      track: 'school',
      subject: 'Physics',
      chapter: 'Motion',
      concepts: ['Speed', 'Velocity'],
      tags: ['motion'],
      difficulty: 'easy',
      body: 'Define velocity and state its SI unit.',
      images: [],
      metadata: {},
      marks: 2,
    },
    {
      id: 'q-phy-02',
      kind: 'question',
      track: 'school',
      subject: 'Physics',
      chapter: 'Motion',
      concepts: ['Acceleration'],
      tags: ['motion'],
      difficulty: 'medium',
      body: 'Derive the first equation of motion v = u + at using graphical method.',
      images: [],
      metadata: {},
      marks: 3,
    },
    {
      id: 'q-phy-03',
      kind: 'question',
      track: 'school',
      subject: 'Physics',
      chapter: 'Laws of Motion',
      concepts: ['Inertia', 'Newton'],
      tags: ['force'],
      difficulty: 'hard',
      body: 'A bullet of mass 20g is horizontally fired with a velocity 150 m/s from a pistol of mass 2 kg. What is the recoil velocity of the pistol?',
      images: [],
      metadata: {},
      marks: 5,
    },
  ];

  const constraints: setPrompt.GenerateSetConstraints = {
    count: options.limit ? Math.min(options.limit, pool.length) : 3,
    marksTotal: 10,
    difficultyMix: { easy: 1, medium: 1, hard: 1 },
    chapterMix: { Motion: 2, 'Laws of Motion': 1 },
  };

  const input: setPrompt.GenerateSetInput = {
    pool,
    constraints,
    allowNewItems: false,
  };

  const promptText = setPrompt.buildUserPrompt(input);
  const setData = await gateway.completeJSON(setPrompt.outputSchema, {
    systemPrompt: setPrompt.systemPrompt,
    userPrompt: promptText,
    forceRefresh: options.force,
  });

  const outputSet = [
    {
      id: 'set-physics-mock-01',
      title: 'Class 9 Physics Practice Worksheet 1',
      scopeLabel: '3 Questions across Motion and Laws of Motion',
      orderedItemIds: setData.orderedItemIds,
      rationale: setData.rationale,
      coverageReport: setData.coverageReport,
    },
  ];

  fs.writeFileSync(targetFile, JSON.stringify(outputSet, null, 2), 'utf-8');
  console.log(`✅ Saved question set to ${targetFile}`);
  return outputSet;
}
