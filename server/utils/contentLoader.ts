import fs from 'node:fs';
import path from 'node:path';
import { ContentItem, Explanation } from '../../src/core/types.js';

export interface LoadedContentContext {
  item: ContentItem;
  explanation?: Explanation;
  sourceChunks: string[];
}

export function loadItemContext(itemId: string, explanationId?: string, fallbackItem?: Partial<ContentItem>): LoadedContentContext | null {
  const contentDirs = [
    path.resolve(process.cwd(), 'content'),
    path.resolve(process.cwd(), 'public', 'content'),
  ];

  let foundItem: ContentItem | null = null;
  let foundExplanation: Explanation | null = null;

  // Search items across all content directories
  for (const contentDir of contentDirs) {
    if (!fs.existsSync(contentDir)) continue;

    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const filePath = path.join(contentDir, file);
        const rawText = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawText);

        if (typeof data === 'object' && data !== null && Array.isArray(data.items)) {
          const item = data.items.find((i: ContentItem) => i.id === itemId);
          if (item) {
            foundItem = item;
            break;
          }
        } else if (Array.isArray(data)) {
          const item = data.find((i: any) => i.id === itemId && i.kind);
          if (item) {
            foundItem = item;
            break;
          }
        }
      } catch {
        // Ignore unparseable files
      }
    }
    if (foundItem) break;
  }

  // Search explanations in explanations.json
  for (const contentDir of contentDirs) {
    const expFile = path.join(contentDir, 'explanations.json');
    if (fs.existsSync(expFile)) {
      try {
        const exps: Explanation[] = JSON.parse(fs.readFileSync(expFile, 'utf-8'));
        const exp = exps.find((e) => e.itemId === itemId || (explanationId && (e as any).id === explanationId));
        if (exp) {
          foundExplanation = exp;
          break;
        }
      } catch {
        // Ignore
      }
    }
  }

  // Fallback to client provided item if not found in static files
  if (!foundItem && fallbackItem && fallbackItem.body) {
    foundItem = {
      id: itemId,
      track: (fallbackItem.track as any) || 'school',
      kind: (fallbackItem.kind as any) || 'concept',
      body: fallbackItem.body,
      subject: fallbackItem.subject,
      chapter: fallbackItem.chapter,
      concepts: fallbackItem.concepts || [],
      images: fallbackItem.images || [],
      tags: fallbackItem.tags || [],
      metadata: fallbackItem.metadata || {},
    } as ContentItem;
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
