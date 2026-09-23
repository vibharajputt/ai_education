// src/core/registry.ts
// ModuleConfig type + the authoritative REGISTRY array.
import React from 'react';
import type { Track } from './types';
import { createModuleViewer } from '../modules/common/ModuleCollectionViewer';

export type ModuleTier = 'A' | 'B' | 'C';

export interface ModuleConfig {
  /** Unique identifier — used in URL: /:track/:id */
  id: string;
  title: string;
  track: Track | 'both';
  /** Class years this targets, e.g. ['11', '12']. Empty = all levels. */
  classLevels: string[];
  /** lucide-react icon name, e.g. 'BookOpen'. */
  icon: string;
  /** Priority tier shown as a badge in the sidebar. A = highest. */
  tier: ModuleTier;
  /**
   * Human-readable scope string, shown in the module header.
   * Must be specific: "120 MCQs across Physics, Chemistry — Class 11".
   * REQUIRED per AGENTS.md non-negotiable rules.
   */
  scopeLabel: string;
  /** Filename under content/ for this module's primary data, e.g. "demo-school.json". */
  dataSource: string;
  /** Lazily-loaded React component. Rendered by ModuleHost via React.Suspense. */
  view: React.LazyExoticComponent<React.FC>;
  /** Whether this module's items are included in global search. */
  searchable: boolean;
  /** Short description shown on the module index card. */
  description: string;
}

import { pyqAnalyzerConfig } from '../modules/pyq-analyzer/config';
import { splitViewConfig } from '../modules/split-view/config';
import { resumeAnalyzerConfig } from '../modules/resume-analyzer/config';
import { syllabusPlanConfig } from '../modules/syllabus-plan/config';
import { sheetGeneratorConfig } from '../modules/sheet-generator/config';
import { quizConfig } from '../modules/quiz/config';
import { progressReportConfig } from '../modules/progress-report/config';
import { swotConfig } from '../modules/weak-topics/config';
import { chemistry3dConfig } from '../modules/chemistry-3d/config';
import { conceptVideosConfig } from '../modules/concept-videos/config';
import { interviewPrepConfig } from '../modules/interview-prep/config';
import { careerPathConfig } from '../modules/career-path/config';

// ---------------------------------------------------------------------------
// Authoritative Registry of Available Platform Modules
// ---------------------------------------------------------------------------

export const REGISTRY: ModuleConfig[] = [
  // ── 1. SIGNATURE EXAM ENGINES ────────────────────────────────────────────
  splitViewConfig,
  pyqAnalyzerConfig,
  syllabusPlanConfig,

  // ── 2. VISUAL STEM & LAB ENGINES ─────────────────────────────────────────
  chemistry3dConfig,
  conceptVideosConfig,
  {
    id: 'mnemonics',
    title: 'Formula Mnemonics',
    track: 'school',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Sparkles',
    tier: 'A',
    scopeLabel: 'High-Retention Memory Anchors & Formula Hooks',
    dataSource: 'mnemonics.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('mnemonics.json', 'Formula Mnemonics') })
    ),
    searchable: true,
    description:
      'High-retention memory anchors, acronyms, and visual recall hooks for formulas and periodic trends.',
  },
  {
    id: 'viva-practice',
    title: 'Board Practical & Viva Prep',
    track: 'school',
    classLevels: ['10', '12'],
    icon: 'Mic',
    tier: 'A',
    scopeLabel: 'Physics & Chemistry Practical Lab Viva Scenarios',
    dataSource: 'viva-practice.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('viva-practice.json', 'Board Practical & Viva Prep') })
    ),
    searchable: true,
    description:
      'Practical lab exam viva questions, expected key phrases, and examiner trap prevention.',
  },

  // ── 3. CONCEPT & REVISION ANCHORS ────────────────────────────────────────
  {
    id: 'question-bank',
    title: 'Adaptive Question Bank',
    track: 'school',
    classLevels: ['9', '10', '11', '12'],
    icon: 'BookOpen',
    tier: 'A',
    scopeLabel: 'Curated Multi-Subject CBSE Board Question Bank',
    dataSource: 'question-bank.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('question-bank.json', 'Adaptive Question Bank') })
    ),
    searchable: true,
    description:
      'Curated board exam questions with step-by-step marking breakdowns and LaTeX solutions.',
  },
  {
    id: 'flashcards',
    title: 'Spaced Recall Flashcards',
    track: 'school',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Layers',
    tier: 'B',
    scopeLabel: 'Active Recall Decks for Key Definitions & Laws',
    dataSource: 'flashcards.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('flashcards.json', 'Spaced Recall Flashcards') })
    ),
    searchable: true,
    description:
      'Spaced repetition flashcards for rapid board exam recall and fundamental definitions.',
  },
  {
    id: 'concept-maps',
    title: 'Visual Concept Mind-Maps',
    track: 'school',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Network',
    tier: 'B',
    scopeLabel: 'Hierarchical Topic Dependency & Visual Trees',
    dataSource: 'concept-maps.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('concept-maps.json', 'Visual Concept Mind-Maps') })
    ),
    searchable: true,
    description:
      'Hierarchical visual knowledge maps and topic dependency structures across STEM.',
  },
  {
    id: 'chapter-summaries',
    title: 'One-Page Chapter Cheat Sheets',
    track: 'school',
    classLevels: ['10', '12'],
    icon: 'FileText',
    tier: 'B',
    scopeLabel: 'Condensed Formula Blueprints & Principles',
    dataSource: 'chapter-summaries.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('chapter-summaries.json', 'One-Page Chapter Cheat Sheets') })
    ),
    searchable: true,
    description:
      'Ultra-dense one-page formula sheets, key principles, and chapter exam blueprints.',
  },

  // ── 4. PRACTICE & DIAGNOSTICS ───────────────────────────────────────────
  sheetGeneratorConfig,
  quizConfig,
  progressReportConfig,
  swotConfig,

  // ── 5. COLLEGE & CAREER PLACEMENTS ──────────────────────────────────────
  resumeAnalyzerConfig,
  interviewPrepConfig,
  careerPathConfig,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a module by id. Returns undefined for unregistered ids. */
export function findModule(id: string): ModuleConfig | undefined {
  return REGISTRY.find((m) => m.id === id);
}

/** All modules for a given track, including modules marked 'both'. */
export function modulesByTrack(track: Track): ModuleConfig[] {
  return REGISTRY.filter((m) => m.track === track || m.track === 'both');
}

/** Look up the ModuleConfig that owns a given dataSource filename. */
export function findModuleByDataSource(
  dataSource: string,
): ModuleConfig | undefined {
  return REGISTRY.find((m) => m.dataSource === dataSource);
}
