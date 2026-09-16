// src/core/types.ts — authoritative content model (see AGENTS.md).
// No module may define its own top-level content type.
// If a module appears to need one, stop and ask.

// ---------------------------------------------------------------------------
// Primitive enums
// ---------------------------------------------------------------------------

export type ContentKind =
  | 'question'
  | 'concept'
  | 'mnemonic'
  | 'viva'
  | 'interview-q'
  | 'tip';

export type Track = 'school' | 'college';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType =
  | 'mcq'
  | 'short'
  | 'long'
  | 'fill-in'
  | 'match'
  | 'assertion-reason';

// ---------------------------------------------------------------------------
// ContentItem — discriminated union on `kind`
// Switch on item.kind to narrow to a specific subtype.
// ---------------------------------------------------------------------------

/** Fields shared by every ContentItem kind. */
interface ContentItemBase {
  id: string;
  track: Track;
  subject?: string;
  chapter?: string;
  /** Topic-level concept tags, e.g. "Newton's Second Law". */
  concepts: string[];
  /**
   * The canonical body text (question, concept description, mnemonic hook, …).
   * Loaders normalise a `text` alias → `body` at load time so JSON authors
   * may use either field name.
   */
  body: string;
  /** Optional LaTeX expression rendered alongside body. */
  latex?: string;
  /** Relative paths to images under /public. */
  images: string[];
  /** Free-form filter tags. */
  tags: string[];
  difficulty?: Difficulty;
  /**
   * Escape hatch for kind-specific structured data not captured above.
   * All kind-specific fields go here rather than extending the interface.
   */
  metadata: Record<string, unknown>;
}

export interface QuestionItem extends ContentItemBase {
  kind: 'question';
  /** Marks allocated to this question in an exam context. */
  marks?: number;
  /** Question format. */
  questionType?: QuestionType;
  /** Exam year this question appeared in. */
  year?: number;
}

export interface ConceptItem extends ContentItemBase {
  kind: 'concept';
}

export interface MnemonicItem extends ContentItemBase {
  kind: 'mnemonic';
}

export interface VivaItem extends ContentItemBase {
  kind: 'viva';
}

export interface InterviewQItem extends ContentItemBase {
  kind: 'interview-q';
}

export interface TipItem extends ContentItemBase {
  kind: 'tip';
}

/** Discriminated union. Switch on `kind` to narrow to a specific item type. */
export type ContentItem =
  | QuestionItem
  | ConceptItem
  | MnemonicItem
  | VivaItem
  | InterviewQItem
  | TipItem;

// ---------------------------------------------------------------------------
// Collection — an ordered, filtered set of ContentItems
// ---------------------------------------------------------------------------

/**
 * An ordered, filtered set of ContentItems.
 *
 * `itemIds` are ordered references resolved to full ContentItem objects by
 * the loader cache. `scopeLabel` is required and shown in every module's
 * header per the AGENTS.md non-negotiable rule.
 */
export interface Collection {
  id: string;
  title: string;
  description: string;
  /**
   * Human-readable scope string displayed in the module header.
   * Must be specific, e.g. "40 MCQs across 6 chapters — Class 11 Physics".
   * REQUIRED — modules that omit this will fail Zod validation.
   */
  scopeLabel: string;
  /** Ordered ids of ContentItems belonging to this collection. */
  itemIds: string[];
  /** Filter facets: key → list of allowed values presented to the user. */
  filters: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Explanation — per-item solution / walkthrough
// ---------------------------------------------------------------------------

export interface ExplanationStep {
  label: string;
  body: string;
}

export interface MarkingBreakdown {
  criterion: string;
  marks: number;
  note?: string;
}

export interface Explanation {
  /** References ContentItem.id */
  itemId: string;
  type: 'solution' | 'answer-framing' | 'step-breakdown';
  /** Full narrative body (markdown). */
  body: string;
  /** Numbered steps for the worked solution. */
  steps: ExplanationStep[];
  /** Bullet-point key takeaways. */
  keyPoints: string[];
  /** Per-criterion mark allocation (exam questions). */
  markingBreakdown: MarkingBreakdown[];
  /** Note describing an accompanying diagram, if any. */
  diagramNote?: string;
  /** Common student mistakes for this item. */
  commonMistakes: string[];
  /** References or textbook sections. */
  sources: string[];
  /** One-line summary for preview cards. */
  summary: string;
}

// ---------------------------------------------------------------------------
// Activity — interactive exercise container
// ---------------------------------------------------------------------------

export type ActivityType = 'quiz' | 'viewer' | 'analyzer' | 'planner';

export interface Activity {
  id: string;
  type: ActivityType;
  moduleSlug: string;
  /** Activity-specific configuration, validated at runtime by the module. */
  config: Record<string, unknown>;
  items: ContentItem[];
}
