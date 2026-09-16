// src/core/loaders.ts
// Typed, cached JSON loaders with Zod validation at load time.
// Components access data only through useCollection — never via direct fetch.

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import type { Collection, ContentItem, ContentKind, Track } from './types';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class LoaderError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly zodError?: z.ZodError,
  ) {
    super(message);
    this.name = 'LoaderError';
  }
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const ContentKindValues: [ContentKind, ...ContentKind[]] = [
  'question', 'concept', 'mnemonic', 'viva', 'interview-q', 'tip',
];
const TrackValues: [Track, Track] = ['school', 'college'];

const ContentItemSchema = z
  .object({
    id: z.string(),
    kind: z.enum(ContentKindValues),
    track: z.enum(TrackValues),
    subject: z.string().optional(),
    chapter: z.string().optional(),
    concepts: z.array(z.string()).default([]),
    // body and text are both accepted; loader normalises to body
    body: z.string().optional(),
    text: z.string().optional(),
    latex: z.string().optional(),
    images: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    marks: z.number().optional(),
    questionType: z
      .enum(['mcq', 'short', 'long', 'fill-in', 'match', 'assertion-reason'])
      .optional(),
    year: z.number().optional(),
    metadata: z.record(z.unknown()).default({}),
  })
  .transform((item) => ({
    ...item,
    // Canonical field: body takes priority; fall back to text; empty string last resort
    body: item.body ?? item.text ?? '',
  }));

const CollectionMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  scopeLabel: z.string().min(1, 'scopeLabel is required (AGENTS.md rule)'),
  filters: z.record(z.array(z.string())).default({}),
});

/** Shape expected in every JSON file under content/. */
const ContentFileSchema = z.object({
  collection: CollectionMetaSchema,
  items: z.array(ContentItemSchema),
});

// ---------------------------------------------------------------------------
// Module-level cache — survives React re-renders and HMR
// ---------------------------------------------------------------------------

const collectionCache = new Map<string, Collection>();
const itemCache = new Map<string, ContentItem>();
/** Maps itemId → dataSource so global search can find the owning module. */
const itemDataSourceIndex = new Map<string, string>();

export function getCachedItem(id: string): ContentItem | undefined {
  return itemCache.get(id);
}

export function getAllCachedItems(): ContentItem[] {
  return Array.from(itemCache.values());
}

export function getItemDataSource(itemId: string): string | undefined {
  return itemDataSourceIndex.get(itemId);
}

// ---------------------------------------------------------------------------
// Core async loader
// ---------------------------------------------------------------------------

export async function loadCollection(
  dataSource: string,
): Promise<{ collection: Collection; items: ContentItem[] }> {
  if (collectionCache.has(dataSource)) {
    const collection = collectionCache.get(dataSource)!;
    const items = collection.itemIds
      .map((id) => itemCache.get(id))
      .filter((i): i is ContentItem => i !== undefined);
    return { collection, items };
  }

  let raw: unknown;

  try {
    const response = await fetch(`/content/${dataSource}`);
    if (!response.ok) {
      throw new LoaderError(
        `HTTP ${response.status} ${response.statusText} loading "${dataSource}"`,
        dataSource,
      );
    }
    raw = await response.json();
  } catch (err) {
    if (err instanceof LoaderError) throw err;
    throw new LoaderError(
      `Failed to fetch or parse "${dataSource}": ${String(err)}`,
      dataSource,
    );
  }

  const result = ContentFileSchema.safeParse(raw);

  if (!result.success) {
    const msg = `Schema validation failed for "${dataSource}"`;
    if (import.meta.env.DEV) {
      // Loud failure in development — expose the exact validation error
      console.error(`[Loader] ${msg}`, result.error.flatten());
    }
    throw new LoaderError(msg, dataSource, result.error);
  }

  const { collection: meta, items: rawItems } = result.data;

  // rawItems is typed as z.infer<typeof ContentItemSchema> after transform.
  // We cast to ContentItem[] — the Zod schema faithfully mirrors the type.
  const items = rawItems as unknown as ContentItem[];

  for (const item of items) {
    itemCache.set(item.id, item);
    itemDataSourceIndex.set(item.id, dataSource);
  }

  const collection: Collection = {
    ...meta,
    itemIds: items.map((i) => i.id),
  };
  collectionCache.set(dataSource, collection);

  return { collection, items };
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export interface UseCollectionResult {
  collection: Collection | null;
  items: ContentItem[];
  loading: boolean;
  error: LoaderError | null;
  /** Call to re-fetch (e.g. from ErrorState retry button). */
  reload: () => void;
}

export function useCollection(dataSource: string): UseCollectionResult {
  const [state, setState] = useState<{
    collection: Collection | null;
    items: ContentItem[];
    loading: boolean;
    error: LoaderError | null;
  }>({ collection: null, items: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await loadCollection(dataSource);
      setState({
        collection: result.collection,
        items: result.items,
        loading: false,
        error: null,
      });
    } catch (err) {
      const loaderErr =
        err instanceof LoaderError
          ? err
          : new LoaderError(String(err), dataSource);
      setState({ collection: null, items: [], loading: false, error: loaderErr });
    }
  }, [dataSource]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
