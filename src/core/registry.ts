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


// ---------------------------------------------------------------------------
// Authoritative Registry of Available Platform Modules
// ---------------------------------------------------------------------------

export const REGISTRY: ModuleConfig[] = [
  // ── SIGNATURE SPLIT-SCREEN EXAM VIEWER ──────────────────────────────────
  splitViewConfig,

  // ── PYQ FORENSIC ANALYZER ──────────────────────────────────────────────────
  pyqAnalyzerConfig,
  {
    ...pyqAnalyzerConfig,
    id: 'past-papers',
    title: 'PYQ Question Bank & Analyzer',
    dataSource: 'pyq-10th.json',
  },

  // ── SCHOOL TRACK (Class 9–12) ─────────────────────────────────────────────
  {
    id: 'question-bank',
    title: 'Adaptive Question Bank',
    track: 'school',
    classLevels: ['11', '12'],
    icon: 'BookOpen',
    tier: 'A',
    scopeLabel: '8 Board Exam Questions across Physics, Chemistry, Math & Biology — Class 11–12',
    dataSource: 'question-bank.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('question-bank.json', 'Adaptive Question Bank') })
    ),
    searchable: true,
    description:
      'Curated board exam questions with step-by-step marking breakdowns and LaTeX solutions.',
  },
  {
    id: 'mnemonics',
    title: 'Formula Mnemonics',
    track: 'school',
    classLevels: ['11', '12'],
    icon: 'Sparkles',
    tier: 'A',
    scopeLabel: '5 High-Yield STEM Mnemonics — Class 11–12',
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
    title: 'Viva Practice',
    track: 'school',
    classLevels: ['12'],
    icon: 'Mic',
    tier: 'A',
    scopeLabel: '4 Board Practical Viva Scenarios — Physics & Chemistry Class 12',
    dataSource: 'viva-practice.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('viva-practice.json', 'Viva Practice') })
    ),
    searchable: true,
    description:
      'Practical lab exam viva questions, expected key phrases, and examiner trap prevention.',
  },
  {
    id: 'flashcards',
    title: 'Flashcard Deck',
    track: 'school',
    classLevels: ['11', '12'],
    icon: 'Layers',
    tier: 'B',
    scopeLabel: '4 Active Recall Flashcards across Physics & Chemistry — Class 12',
    dataSource: 'flashcards.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('flashcards.json', 'Flashcard Deck') })
    ),
    searchable: true,
    description:
      'Spaced repetition flashcards for rapid board exam recall and fundamental definitions.',
  },
  {
    id: 'concept-maps',
    title: 'Concept Maps',
    track: 'school',
    classLevels: ['11', '12'],
    icon: 'Network',
    tier: 'B',
    scopeLabel: '2 Concept Hierarchy Maps for High School STEM',
    dataSource: 'concept-maps.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('concept-maps.json', 'Concept Maps') })
    ),
    searchable: true,
    description:
      'Hierarchical visual knowledge maps and topic dependency structures across STEM.',
  },
  {
    id: 'chapter-summaries',
    title: 'Chapter Summaries',
    track: 'school',
    classLevels: ['12'],
    icon: 'FileText',
    tier: 'B',
    scopeLabel: '2 Condensed STEM Chapter Summaries for Class 12 Boards',
    dataSource: 'chapter-summaries.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('chapter-summaries.json', 'Chapter Summaries') })
    ),
    searchable: true,
    description:
      'Ultra-dense one-page formula sheets, key principles, and chapter exam blueprints.',
  },
  syllabusPlanConfig,
  {
    ...syllabusPlanConfig,
    id: 'study-planner',
    title: 'Study Planner & Adaptive Roadmap',
  },
  // ── PRACTICE & PROGRESS CLUSTER ──────────────────────────────────────────
  sheetGeneratorConfig,
  quizConfig,
  progressReportConfig,
  {
    ...progressReportConfig,
    id: 'progress',
    title: 'Progress & Mastery Matrix',
  },
  swotConfig,
  {
    ...swotConfig,
    id: 'swot',
    title: 'SWOT Diagnostic Matrix',
  },
  {
    ...quizConfig,
    id: 'aptitude-drill',
    title: 'Aptitude & Practice Quiz Drill',
  },

  // ── COLLEGE & PLACEMENT TRACK ─────────────────────────────────────────────
  {
    id: 'interview-prep',
    title: 'Interview Q&A Prep',
    track: 'college',
    classLevels: [],
    icon: 'GraduationCap',
    tier: 'A',
    scopeLabel: '4 Tech & Behavioral Interview Scenarios for Engineering Students',
    dataSource: 'interview-prep.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('interview-prep.json', 'Interview Q&A Prep') })
    ),
    searchable: true,
    description:
      'Technical system design, DSA, and STAR-method behavioral questions with rubric scoring.',
  },
  resumeAnalyzerConfig,
  {
    id: 'career-path',
    title: 'Career Path Explorer',
    track: 'college',
    classLevels: [],
    icon: 'Compass',
    tier: 'B',
    scopeLabel: '2 Tech & Science Career Roadmaps with Industry Milestones',
    dataSource: 'career-path.json',
    view: React.lazy(() =>
      Promise.resolve({ default: createModuleViewer('career-path.json', 'Career Path Explorer') })
    ),
    searchable: true,
    description:
      'Skill trees, milestone progressions, and compensation benchmarks for ML, Cloud, and Web engineering.',
  },



  // ── SCIENCE ENRICHMENT ──────────────────────────────────────────────────
  chemistry3dConfig,
  conceptVideosConfig,

  // ── DEMO / REFERENCE MODULES ──────────────────────────────────────────────
  {
    id: 'demo-school',
    title: 'Demo School Questions',
    track: 'school',
    classLevels: ['11', '12'],
    icon: 'BookMarked',
    tier: 'C',
    scopeLabel: '5 sample questions across Physics & Chemistry — Class 11–12',
    dataSource: 'demo-school.json',
    view: React.lazy(() =>
      import('../modules/demo-school/index').then((m) => ({
        default: m.DemoSchoolModule,
      }))
    ),
    searchable: true,
    description:
      'Exemplar questions demonstrating CBSE physics and chemistry step breakdown solutions.',
  },
  {
    id: 'demo-college',
    title: 'Demo College Prep',
    track: 'college',
    classLevels: [],
    icon: 'Briefcase',
    tier: 'C',
    scopeLabel: '5 sample interview questions across CS & Management',
    dataSource: 'demo-college.json',
    view: React.lazy(() =>
      import('../modules/demo-college/index').then((m) => ({
        default: m.DemoCollegeModule,
      }))
    ),
    searchable: true,
    description:
      'Sample tech and management interview questions demonstrating answer framing blueprints.',
  },
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
