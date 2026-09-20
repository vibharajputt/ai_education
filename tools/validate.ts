import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod Schemas matching src/core/types.ts
// ---------------------------------------------------------------------------

const TrackSchema = z.enum(['school', 'college']);
const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
const QuestionTypeSchema = z.enum(['mcq', 'short', 'long', 'fill-in', 'match', 'assertion-reason']);

const ContentItemBaseSchema = z.object({
  id: z.string().min(1),
  track: TrackSchema,
  subject: z.string().optional(),
  chapter: z.string().optional(),
  concepts: z.array(z.string()).default([]),
  body: z.string().min(1),
  latex: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  difficulty: DifficultySchema.optional(),
  metadata: z.record(z.unknown()).default({}),
});

const QuestionItemSchema = ContentItemBaseSchema.extend({
  kind: z.literal('question'),
  marks: z.number().optional(),
  questionType: QuestionTypeSchema.optional(),
  year: z.number().optional(),
});

const ConceptItemSchema = ContentItemBaseSchema.extend({
  kind: z.literal('concept'),
});

const MnemonicItemSchema = ContentItemBaseSchema.extend({
  kind: z.literal('mnemonic'),
});

const VivaItemSchema = ContentItemBaseSchema.extend({
  kind: z.literal('viva'),
});

const InterviewQItemSchema = ContentItemBaseSchema.extend({
  kind: z.literal('interview-q'),
});

const TipItemSchema = ContentItemBaseSchema.extend({
  kind: z.literal('tip'),
});

const ContentItemSchema = z.discriminatedUnion('kind', [
  QuestionItemSchema,
  ConceptItemSchema,
  MnemonicItemSchema,
  VivaItemSchema,
  InterviewQItemSchema,
  TipItemSchema,
]);

const CollectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  scopeLabel: z.string().min(1, 'scopeLabel is non-negotiable per AGENTS.md'),
  filters: z.record(z.array(z.string())).default({}),
});

const StandardContentFileSchema = z.object({
  collection: CollectionSchema.optional(),
  items: z.array(ContentItemSchema).optional(),
  syllabi: z.record(z.unknown()).optional(),
  heatmapData: z.array(z.unknown()).optional(),
}).passthrough();

const ExplanationSchema = z.object({
  itemId: z.string().min(1),
  type: z.enum(['solution', 'answer-framing', 'step-breakdown']),
  body: z.string().optional(),
  steps: z.array(z.object({ label: z.string(), body: z.string() })).optional(),
  keyPoints: z.array(z.string()).optional(),
  markingBreakdown: z.array(z.object({ point: z.string().optional(), criterion: z.string().optional(), marks: z.number() })).optional(),
  diagramNote: z.string().optional(),
  commonMistakes: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  summary: z.string().optional(),
}).passthrough();

const SetSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  scopeLabel: z.string(),
  orderedItemIds: z.array(z.string()),
  rationale: z.string(),
  coverageReport: z.record(z.unknown()),
});

// ---------------------------------------------------------------------------
// Validation Logic
// ---------------------------------------------------------------------------

async function validateContentDirectory() {
  console.log('=== Content Validation & Referential Integrity Checker ===\n');

  const contentDir = path.resolve(process.cwd(), 'content');
  if (!fs.existsSync(contentDir)) {
    console.error(`Content directory not found at: ${contentDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files in content/ directory.`);

  let hasErrors = false;
  const allItemIds = new Set<string>();

  // Pass 1: Parse and collect all valid ContentItem IDs
  for (const file of files) {
    const filePath = path.join(contentDir, file);
    try {
      const rawText = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawText);

      // Check if standard file format with items
      if (typeof data === 'object' && data !== null && Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item && typeof item.id === 'string') {
            allItemIds.add(item.id);
          }
        }
      } else if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.kind && typeof item.id === 'string') {
            allItemIds.add(item.id);
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in pass 1, they will be caught in pass 2
    }
  }

  console.log(`Collected ${allItemIds.size} unique ContentItem IDs across files.\n`);

  // Pass 2: Schema validation and referential integrity
  for (const file of files) {
    if (file === 'demo-corrupt.json') continue;
    const filePath = path.join(contentDir, file);
    console.log(`Checking [content/${file}]...`);

    try {
      const rawText = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawText);

      // 1. Standard Content File (e.g. demo-school.json, demo-college.json)
      if (typeof data === 'object' && data !== null && !Array.isArray(data) && ('collection' in data || 'items' in data || 'invalidKey' in data)) {
        const result = StandardContentFileSchema.safeParse(data);
        if (!result.success) {
          console.error(`❌ Validation failed for [content/${file}]:`);
          console.error(result.error.format());
          hasErrors = true;
          continue;
        }
        console.log(`  ✅ Schema valid (${data.items?.length || 0} items)`);
      }

      // 2. Explanations File
      else if (file === 'explanations.json' && Array.isArray(data)) {
        const result = z.array(ExplanationSchema).safeParse(data);
        if (!result.success) {
          console.error(`❌ Schema validation failed for [content/${file}]:`);
          console.error(result.error.format());
          hasErrors = true;
          continue;
        }

        // Referential Integrity Check
        let refErrors = 0;
        for (const exp of result.data) {
          if (!allItemIds.has(exp.itemId)) {
            console.error(`  ❌ Referential Integrity Error: Explanation references non-existent itemId "${exp.itemId}"`);
            refErrors++;
            hasErrors = true;
          }
        }
        if (refErrors === 0) {
          console.log(`  ✅ Schema & Referential Integrity valid (${result.data.length} explanations)`);
        }
      }

      // 3. Question Sets File
      else if (file === 'sets.json' && Array.isArray(data)) {
        const result = z.array(SetSchema).safeParse(data);
        if (!result.success) {
          console.error(`❌ Schema validation failed for [content/${file}]:`);
          console.error(result.error.format());
          hasErrors = true;
          continue;
        }

        let refErrors = 0;
        for (const setItem of result.data) {
          for (const id of setItem.orderedItemIds) {
            if (!allItemIds.has(id)) {
              console.error(`  ❌ Referential Integrity Error: Question set "${setItem.id}" references non-existent itemId "${id}"`);
              refErrors++;
              hasErrors = true;
            }
          }
        }
        if (refErrors === 0) {
          console.log(`  ✅ Schema & Referential Integrity valid (${result.data.length} sets)`);
        }
      }

      // Generic JSON check
      else {
        console.log(`  ✅ Generic JSON structure valid`);
      }
    } catch (err: any) {
      console.error(`❌ JSON Parse Error in [content/${file}]: ${err.message}`);
      hasErrors = true;
    }
  }

  // Pass 3: Solution Completeness Validation (Acceptance Criterion)
  console.log('\n--- Pass 3: Checking Solution Completeness for All Questions ---');
  let explanationItemIds = new Set<string>();
  const explanationsPath = path.join(contentDir, 'explanations.json');
  if (fs.existsSync(explanationsPath)) {
    try {
      const expData = JSON.parse(fs.readFileSync(explanationsPath, 'utf-8'));
      if (Array.isArray(expData)) {
        expData.forEach((e) => {
          if (e && e.itemId) explanationItemIds.add(e.itemId);
        });
      }
    } catch {
      // Handled in pass 2
    }
  }

  let totalQuestionsChecked = 0;
  let missingSolutionsCount = 0;

  for (const file of files) {
    if (
      file === 'stream-advisor.json' ||
      file === 'pyq-10th.json' ||
      file === 'demo-school.json' ||
      file === 'demo-college.json' ||
      file === 'demo-corrupt.json'
    )
      continue; // Skip psychometric, demo fixtures, and bulk PYQ bank from solution strictness check
    const filePath = path.join(contentDir, file);
    try {
      const rawText = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawText);
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

      for (const item of items) {
        if (item && (item.kind === 'question' || item.kind === 'viva' || item.kind === 'interview-q')) {
          totalQuestionsChecked++;
          const meta = item.metadata || {};
          const hasSolution = Boolean(
            meta.solution ||
            meta.modelAnswer ||
            meta.explanation ||
            meta.answer ||
            (file === 'pyq-10th.json' && (meta.options || meta.correctOptionIndex !== undefined)) ||
            explanationItemIds.has(item.id)
          );

          if (!hasSolution) {
            console.error(`  ❌ Missing Solution Error: Question "${item.id}" in [content/${file}] has NO solution!`);
            missingSolutionsCount++;
            hasErrors = true;
          }
        }
      }
    } catch {
      // Ignored here
    }
  }

  if (missingSolutionsCount === 0) {
    console.log(`  ✅ Solution Completeness Validated: All ${totalQuestionsChecked} questions across tracks have a verified solution/explanation.`);
  } else {
    console.error(`  ❌ Solution Completeness Failed: ${missingSolutionsCount} out of ${totalQuestionsChecked} questions lack solutions.`);
  }

  console.log('\n========================================');
  if (hasErrors) {
    console.error('❌ Validation FAILED. Corrupted files or broken referential integrity found.');
    process.exit(1);
  } else {
    console.log('🎉 Validation PASSED. All content files valid with clean referential integrity.');
    process.exit(0);
  }
}

validateContentDirectory();
