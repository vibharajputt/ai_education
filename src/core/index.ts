// src/core/index.ts — public barrel for src/core/
// Consumers import from '@core', not from deep paths.

export type {
  ContentKind,
  Track,
  Difficulty,
  QuestionType,
  ContentItem,
  QuestionItem,
  ConceptItem,
  MnemonicItem,
  VivaItem,
  InterviewQItem,
  TipItem,
  Collection,
  ExplanationStep,
  MarkingBreakdown,
  Explanation,
  ActivityType,
  Activity,
} from './types';

export type { ModuleTier, ModuleConfig } from './registry';
export { REGISTRY, findModule, modulesByTrack } from './registry';

export type { UseCollectionResult } from './loaders';
export {
  LoaderError,
  loadCollection,
  useCollection,
  getCachedItem,
  getAllCachedItems,
  getItemDataSource,
} from './loaders';

export type { ExplainRequest, ExplainStreamChunk } from './aiClient';
export { explainItem, explainItemFull } from './aiClient';

export * from './progress';

