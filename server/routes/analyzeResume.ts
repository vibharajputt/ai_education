import { Request, Response, Router } from 'express';
import multer from 'multer';
import { LLMGateway } from '../../tools/llm/gateway.js';
import * as analyzePrompt from '../../tools/prompts/analyze_artifact.js';
import { extractTextFromBuffer, sniffMimeType } from '../utils/fileParser.js';
import { resumeRateLimiter } from '../middleware/rateLimiter.js';

export const resumeRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const gateway = new LLMGateway();

resumeRouter.post(
  '/api/analyze-resume',
  resumeRateLimiter,
  upload.single('file'),
  async (req: Request, res: Response): Promise<any> => {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE_UPLOADED',
          message: 'Please upload a PDF or DOCX document (max 5MB).',
        },
      });
    }

    // 1. MIME Sniffing Check (Do NOT trust file extension or header)
    const mimeType = sniffMimeType(req.file.buffer);
    if (mimeType === 'unknown') {
      return res.status(400).json({
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Security validation failed: File content does not match genuine PDF or DOCX binary structure.',
        },
      });
    }

    try {
      // 2. In-Memory Text Extraction (No disk writes)
      const artifactText = await extractTextFromBuffer(req.file.buffer);
      const targetSpec = (req.body.targetSpec || req.body.jd || req.body.jobDescription || '').toString();

      if (artifactText.length < 30) {
        return res.status(422).json({
          error: {
            code: 'INSUFFICIENT_TEXT',
            message: 'Unable to extract legible text from the uploaded document.',
          },
        });
      }

      // 3. Build & Run Analyze Artifact Template
      const input: analyzePrompt.AnalyzeArtifactInput = {
        artifactText,
        artifactType: 'resume',
        targetSpec: targetSpec || undefined,
      };

      const promptText = analyzePrompt.buildUserPrompt(input);
      const analysisData = await gateway.completeJSON(analyzePrompt.outputSchema, {
        systemPrompt: analyzePrompt.systemPrompt,
        userPrompt: promptText,
      });

      // Calculate ATS score out of 100 from scores dictionary
      const scoreValues = Object.values(analysisData.scores || {});
      const atsScore = scoreValues.length > 0
        ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
        : 75;

      return res.json({
        atsScore,
        structure: analysisData.structure,
        findings: analysisData.findings,
        rewrites: analysisData.rewrites,
        extractedEntities: analysisData.extractedEntities,
        scores: analysisData.scores,
        jdMatch: targetSpec ? { targetSpecProvided: true } : undefined,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Failed to complete resume analysis. ' + (err.message || ''),
        },
      });
    }
  }
);
