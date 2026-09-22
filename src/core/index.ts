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

export type { AssistRequest, AssistRequest as ExplainRequest, ExplainStreamChunk } from './aiClient';
export { explainItem, explainItemFull } from './aiClient';

export type {
  AttemptRecord,
  ItemReviewState,
  ConceptMastery,
  MasteryStatus,
  UserStats,
  ProgressStoreState,
  FSRSGrade,
  SwotStats,
} from './progress';
export {
  CURRENT_SCHEMA_VERSION,
  ELO_CONFIG,
  FSRS_CONFIG,
  getInitialState,
  ratingToMasteryPercent,
  calculateNewElo,
  determineFSRSGrade,
  calculateNextReview,
  recalculateUserStats,
  loadStore,
  saveStore,
  recordAttempt,
  recordBatchAttempts,
  resetProgressStore,
  clearStore,
  getDueItems,
  getAccuracyTrend,
  getTimeTrend,
  getSwotStatistics,
  useProgressStore,
} from './progress';

export {
  DEMO_SEED_ITEMS,
  generateDemoAttempts,
  loadDemoData,
  clearDemoData,
  checkAndAutoSeedDemo,
} from './demoSeed';

