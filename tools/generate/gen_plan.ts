import fs from 'node:fs';
import path from 'node:path';
import { LLMGateway } from '../llm/gateway.js';
import * as planPrompt from '../prompts/plan.ts';

export interface GenOptions {
  force?: boolean;
  limit?: number;
}

export async function generateStudyPlans(gateway: LLMGateway, options: GenOptions = {}) {
  console.log('--- Generating Study Plans ---');

  const contentDir = path.resolve(process.cwd(), 'content');
  const targetFile = path.join(contentDir, 'study_plans.json');

  const input: planPrompt.PlanInput = {
    goal: 'Score 95%+ in Class 12 Physics CBSE Board Exam',
    deadline: '2026-03-15',
    hoursPerDay: 4,
    syllabusUnits: ['Electrostatics', 'Current Electricity', 'Magnetic Effects of Current', 'Optics'],
    currentMastery: {
      Electrostatics: 80,
      'Current Electricity': 60,
      'Magnetic Effects of Current': 40,
      Optics: 30,
    },
  };

  const promptText = planPrompt.buildUserPrompt(input);
  const planOutput = await gateway.completeJSON(planPrompt.outputSchema, {
    systemPrompt: planPrompt.systemPrompt,
    userPrompt: promptText,
    forceRefresh: options.force,
  });

  // Explicit code-level validation per prompt requirement
  try {
    planPrompt.validatePlanCode(planOutput, input);
    console.log('✅ Plan passed TypeScript code-level validation (daily minutes & unit coverage).');
  } catch (err: any) {
    console.warn(`⚠️ TypeScript Plan Validation warning: ${err.message}`);
  }

  const output = [
    {
      id: 'plan-cbse12-physics-01',
      goal: input.goal,
      deadline: input.deadline,
      hoursPerDay: input.hoursPerDay,
      plan: planOutput,
    },
  ];

  fs.writeFileSync(targetFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Saved study plan to ${targetFile}`);
  return output;
}
