import fs from 'node:fs';
import path from 'node:path';
import { ContentItem, Explanation } from '../../src/core/types.js';

export interface LoadedContentContext {
  item: ContentItem;
  explanation?: Explanation;
  sourceChunks: string[];
}

export function loadItemContext(itemId: string, explanationId?: string): LoadedContentContext | null {
  const contentDir = path.resolve(process.cwd(), 'content');
  if (!fs.existsSync(contentDir)) return null;

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'));

  let foundItem: ContentItem | null = null;
  let foundExplanation: Explanation | null = null;

  // Search items across all content files
  for (const file of files) {
    try {
      const filePath = path.join(contentDir, file);
      const rawText = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawText);

      if (typeof data === 'object' && data !== null && Array.isArray(data.items)) {
        const item = data.items.find((i: ContentItem) => i.id === itemId);
        if (item) foundItem = item;
      } else if (Array.isArray(data)) {
        const item = data.find((i: any) => i.id === itemId && i.kind);
        if (item) foundItem = item;
      }
    } catch {
      // Ignore unparseable files
    }
  }

  // Search explanations in explanations.json
  const expFile = path.join(contentDir, 'explanations.json');
  if (fs.existsSync(expFile)) {
    try {
      const exps: Explanation[] = JSON.parse(fs.readFileSync(expFile, 'utf-8'));
      const exp = exps.find((e) => e.itemId === itemId || (explanationId && (e as any).id === explanationId));
      if (exp) foundExplanation = exp;
    } catch {
      // Ignore
    }
  }

  if (!foundItem) return null;

  const sourceChunks: string[] = [];
  sourceChunks.push(`[Question Body]: ${foundItem.body}`);
  if (foundItem.latex) {
    sourceChunks.push(`[LaTeX Formula]: ${foundItem.latex}`);
  }
  if (foundItem.chapter) {
    sourceChunks.push(`[Chapter]: ${foundItem.chapter}`);
  }
  if (foundItem.subject) {
    sourceChunks.push(`[Subject]: ${foundItem.subject}`);
  }

  if (foundExplanation) {
    sourceChunks.push(`[Verified Solution Summary]: ${foundExplanation.summary || foundExplanation.body}`);
    if (foundExplanation.steps) {
      for (const step of foundExplanation.steps) {
        sourceChunks.push(`[Step: ${step.label}]: ${step.body}`);
      }
    }
    if (foundExplanation.keyPoints) {
      sourceChunks.push(`[Key Points]: ${foundExplanation.keyPoints.join('; ')}`);
    }
  }

  return {
    item: foundItem,
    explanation: foundExplanation || undefined,
    sourceChunks,
  };
}
