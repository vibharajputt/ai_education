import fs from 'node:fs';
import path from 'node:path';
import { LLMGateway } from '../llm/gateway.js';
import * as analyzePrompt from '../prompts/analyze_artifact.ts';

export interface GenOptions {
  force?: boolean;
  limit?: number;
}

export async function generateArtifactAnalyses(gateway: LLMGateway, options: GenOptions = {}) {
  console.log('--- Generating Artifact Analyses ---');

  const contentDir = path.resolve(process.cwd(), 'content');
  const targetFile = path.join(contentDir, 'artifact_analyses.json');

  const sampleResume = `John Doe
Full Stack Developer | Email: john@example.com

EXPERIENCE:
Software Engineering Intern at Acme Corp (Jun 2023 - Aug 2023)
- Built a web app using HTML and JS.
- Helped team fix bugs.

PROJECTS:
Portfolio Website
- Created website using CSS.

SKILLS:
JavaScript, HTML, CSS`;

  const input: analyzePrompt.AnalyzeArtifactInput = {
    artifactText: sampleResume,
    artifactType: 'resume',
    targetSpec: 'Senior Software Engineer Role requiring React, TypeScript, Node.js, System Design',
  };

  const promptText = analyzePrompt.buildUserPrompt(input);
  const analysis = await gateway.completeJSON(analyzePrompt.outputSchema, {
    systemPrompt: analyzePrompt.systemPrompt,
    userPrompt: promptText,
    forceRefresh: options.force,
  });

  const output = [
    {
      id: 'analysis-sample-resume-01',
      artifactType: input.artifactType,
      targetSpec: input.targetSpec,
      result: analysis,
    },
  ];

  fs.writeFileSync(targetFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Saved artifact analysis to ${targetFile}`);
  return output;
}
