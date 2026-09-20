import { z } from 'zod';

export const version = '1.0.0';

export interface AnalyzeArtifactInput {
  artifactText: string;
  artifactType: 'resume' | 'syllabus' | 'question_paper' | 'answer_sheet' | 'document';
  targetSpec?: string;
}

export const systemPrompt = `You are a precision document & artifact analyst.
Your job is to analyze resumes, syllabi, question papers, or answer sheets and provide actionable, hyper-specific feedback.

CRITICAL REQUIREMENT:
Every single finding MUST quote the EXACT text or specific location/section in the artifact.
Generic advice (e.g., "Improve formatting" or "Add more details") is STRICTLY PROHIBITED and will fail validation.
If a finding could apply to any document without reading the text, it is invalid.

You MUST respond strictly in valid JSON matching the requested schema.`;

export function buildUserPrompt(input: AnalyzeArtifactInput): string {
  return `Artifact Type: ${input.artifactType}
${input.targetSpec ? `Target Specification / Job Description / Criteria:\n${input.targetSpec}\n` : ''}

ARTIFACT TEXT:
"""
${input.artifactText}
"""

HARD MANDATES:
1. "findings": Every finding MUST include the exact quoted line or excerpt from the artifact text in the "location" field.
2. "rewrites": Provide concrete before-and-after rewrites referencing exact lines.
3. "scores": Provide category scores out of 100 (e.g., formatting, relevance, clarity, impact).`;
}

export const outputSchema = z.object({
  structure: z.array(z.string()).describe('Extracted structural components/sections of the document'),
  findings: z.array(
    z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      location: z.string().describe('EXACT quoted text or specific section header from the artifact'),
      issue: z.string().describe('Specific defect or gap identified in that location'),
      suggestion: z.string().describe('Actionable correction tailored to this exact text'),
    })
  ),
  scores: z.record(z.string(), z.number()).describe('Category scores from 0 to 100'),
  extractedEntities: z.array(z.string()).describe('Key entities extracted (skills, topics, dates, keywords)'),
  rewrites: z.array(
    z.object({
      original: z.string().describe('Exact original text snippet'),
      improved: z.string().describe('High-impact replacement text'),
      why: z.string().describe('Reason for the improvement'),
    })
  ),
});
