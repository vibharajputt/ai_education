// src/core/registry.ts
// ModuleConfig type + the authoritative REGISTRY array.
//
// Adding a module to this platform requires exactly two things:
//   1. One entry in REGISTRY below
//   2. One JSON data file under content/
//
// Everything else (sidebar, routing, search, module index) is generated
// automatically from this registry.

import React from 'react';
import type { Track } from './types';

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

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
// NOTE: Dynamic imports below create a lazy graph from core → modules.
// This is intentional: modules are never eagerly imported — they are loaded
// on demand when their route is activated. TypeScript resolves the import
// type lazily, so circular-ref warnings from the barrel (index.ts) are
// avoided when modules only import from @core/types, @core/loaders, etc.
// ---------------------------------------------------------------------------

export const REGISTRY: ModuleConfig[] = [
  // ── DEMO (remove in Task 2) ──────────────────────────────────────────────
  {
    id: 'demo-school',
    title: 'Demo Questions',
    track: 'school',
    classLevels: ['11', '12'],
    icon: 'BookOpen',
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
      'Throwaway demo module proving the school-track engine end-to-end. Delete in Task 2.',
  },
  {
    id: 'demo-college',
    title: 'Demo Interview Prep',
    track: 'college',
    classLevels: [],
    icon: 'GraduationCap',
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
      'Throwaway demo module proving the college-track engine end-to-end. Delete in Task 2.',
  },
  {
    id: 'pyq-analyzer',
    title: 'PYQ Chapter & Concept Heatmap',
    track: 'school',
    classLevels: ['10'],
    icon: 'BarChart3',
    tier: 'A',
    scopeLabel: 'Class 10 Science + Maths, 2015-2024, 812 questions',
    dataSource: 'pyq-10th.json',
    view: React.lazy(() =>
      import('../modules/pyq-analyzer/index').then((m) => ({
        default: m.PyqAnalyzerModule,
      }))
    ),
    searchable: true,
    description:
      '10-year trend analysis, repeat concept ranking, difficulty breakdown, and question browser across Class 10 Board Exams.',
  },
  {
    id: 'split-view',
    title: 'Split-Screen Paper & Answer Coach',
    track: 'school',
    classLevels: ['10', '11', '12'],
    icon: 'Split',
    tier: 'A',
    scopeLabel: '40 Questions across Class 10 STEM — CBSE Board Paper',
    dataSource: 'split-view-paper.json',
    view: React.lazy(() =>
      import('../modules/split-view/index').then((m) => ({
        default: m.SplitViewModule,
      }))
    ),
    searchable: true,
    description:
      'Product signature split-screen workspace with resizable divider, scroll sync, mark-wise Answer Coach, and keyboard shortcuts.',
  },
  {
    id: 'resume-analyzer',
    title: 'AI Resume & ATS Analyzer',
    track: 'college',
    classLevels: [],
    icon: 'FileCheck',
    tier: 'A',
    scopeLabel: 'ATS Score, Line-by-Line Findings, Rewrites & JD Gap Analysis',
    dataSource: 'artifact_analyses.json',
    view: React.lazy(() =>
      import('../modules/resume-analyzer/index').then((m) => ({
        default: m.ResumeAnalyzerModule,
      }))
    ),
    searchable: true,
    description:
      'Live AI-augmented resume parser & ATS optimizer with line-by-line quoted findings, bullet point diff rewrites, and target job description gap analysis.',
  },
  {
    id: 'syllabus-plan',
    title: 'Syllabus to Study Plan Generator',
    track: 'both',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Calendar',
    tier: 'B',
    scopeLabel: 'Syllabus PDF Parsing, Deadline Scheduling, Day-wise Allocation & Re-planner',
    dataSource: 'study_plans.json',
    view: React.lazy(() =>
      import('../modules/syllabus-plan/index').then((m) => ({
        default: m.SyllabusPlanModule,
      }))
    ),
    searchable: true,
    description:
      'Upload a syllabus PDF or paste text to generate a day-wise study schedule. Features strictly capped hours/day, persistent checkboxes, dropped unit reasons, and deadline re-planner.',
  },
  {
    id: 'sheet-generator',
    title: 'Worksheet & Practice Paper Generator',
    track: 'both',
    classLevels: ['9', '10', '11', '12'],
    icon: 'FileText',
    tier: 'B',
    scopeLabel: 'Custom Chapter Mix, Printable A4 Worksheets, Coverage Report & Answer Keys',
    dataSource: 'pyq-10th.json',
    view: React.lazy(() =>
      import('../modules/sheet-generator/index').then((m) => ({
        default: m.SheetGeneratorModule,
      }))
    ),
    searchable: true,
    description:
      'Generate customized, printable A4 practice worksheets with chapter coverage reports, difficulty mixes, and separate answer key pages.',
  },
  {
    id: 'quiz',
    title: 'Interactive Adaptive Practice Quiz',
    track: 'both',
    classLevels: ['9', '10', '11', '12'],
    icon: 'HelpCircle',
    tier: 'B',
    scopeLabel: 'Daily (10q), Weekly (25q), Monthly (50q) & Custom Timed Quizzes',
    dataSource: 'pyq-10th.json',
    view: React.lazy(() =>
      import('../modules/quiz/index').then((m) => ({
        default: m.QuizModule,
      }))
    ),
    searchable: true,
    description:
      'Timed adaptive practice quiz feeding attempts into real-time progress store, Elo ratings, and FSRS spaced repetition queue.',
  },
  {
    id: 'progress',
    title: 'Progress & Mastery Dashboard',
    track: 'both',
    classLevels: ['9', '10', '11', '12'],
    icon: 'TrendingUp',
    tier: 'B',
    scopeLabel: 'Elo Concept Heat Strips, Accuracy & Time Trends, FSRS Revision Queue',
    dataSource: 'pyq-10th.json',
    view: React.lazy(() =>
      import('../modules/progress/index').then((m) => ({
        default: m.ProgressModule,
      }))
    ),
    searchable: true,
    description:
      'Deterministic analytics dashboard featuring Elo concept heat strips, accuracy trends, speed metrics, streak counters, and FSRS spaced repetition queue.',
  },
  {
    id: 'swot',
    title: 'SWOT Analysis & Diagnostic Profile',
    track: 'both',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Compass',
    tier: 'B',
    scopeLabel: 'Strengths, Weaknesses, Opportunities & Threats Profile Matrix',
    dataSource: 'profile_summaries.json',
    view: React.lazy(() =>
      import('../modules/swot/index').then((m) => ({
        default: m.SwotModule,
      }))
    ),
    searchable: true,
    description:
      'Deterministic Strengths, Weaknesses, Opportunities, and Threats matrix matching pre-generated profile narratives without live runtime AI calls.',
  },
  {
    id: 'chemistry-3d',
    title: '3D Molecular Structures & Reaction Mechanisms',
    track: 'school',
    classLevels: ['11', '12'],
    icon: 'Atom',
    tier: 'B',
    scopeLabel: '15 3D Molecules, 4 Stepped Organic Mechanisms, 20 Reaction Exceptions — CBSE Class 11-12',
    dataSource: 'chemistry-3d.json',
    view: React.lazy(() =>
      import('../modules/chemistry-3d/index').then((m) => ({
        default: m.Chemistry3DModule,
      }))
    ),
    searchable: true,
    description:
      'Interactive 3Dmol.js molecular visualization with style & label toggles, WebGL fallback, 4 stepped organic reaction mechanisms, and 20 reaction exception rules.',
  },
  {
    id: 'experiments',
    title: 'CBSE Class 10 Virtual Science Experiments',
    track: 'school',
    classLevels: ['10'],
    icon: 'FlaskConical',
    tier: 'B',
    scopeLabel: '8 CBSE Class 10 Experiments with PhET Simulations & Persistent Observation Tables',
    dataSource: 'experiments.json',
    view: React.lazy(() =>
      import('../modules/experiments/index').then((m) => ({
        default: m.ExperimentsModule,
      }))
    ),
    searchable: true,
    description:
      '8 CBSE Class 10 Science experiments featuring embedded PhET simulations, step-by-step procedures, persistent observation tables, results, and precautions.',
  },
  {
    id: 'viva',
    title: 'Practical Viva Voce Practice & Quiz Coach',
    track: 'school',
    classLevels: ['10'],
    icon: 'HelpCircle',
    tier: 'B',
    scopeLabel: '96 Practical Viva Questions across 8 CBSE Science Experiments — Class 10',
    dataSource: 'viva.json',
    view: React.lazy(() =>
      import('../modules/viva/index').then((m) => ({
        default: m.VivaModule,
      }))
    ),
    searchable: true,
    description:
      'Exemplar practical viva question bank per experiment with model answers, examiner tips, difficulty filters, and interactive self-scored "Quiz Me" mode.',
  },
  {
    id: 'stream-advisor',
    title: 'Class 10 Stream Selection Advisor',
    track: 'school',
    classLevels: ['10'],
    icon: 'Compass',
    tier: 'B',
    scopeLabel: '15-Question Aptitude & Interest Assessment — Class 10 Stream Selection',
    dataSource: 'stream-advisor.json',
    view: React.lazy(() =>
      import('../modules/stream-advisor/index').then((m) => ({
        default: m.StreamAdvisorModule,
      }))
    ),
    searchable: true,
    description:
      '15-question psychometric instrument for Class 10 stream selection. Features 100% deterministic TypeScript scoring rubric, confidence bands, driving answer reasoning, and retake comparison.',
  },
  {
    id: 'wellbeing',
    title: 'Exam Wellbeing & Relaxation Hub',
    track: 'both',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Heart',
    tier: 'C',
    scopeLabel: 'Study-Skills & Relaxation Tools — Zero-AI, Non-Medical Exam Stress Support',
    dataSource: 'wellbeing.json',
    view: React.lazy(() =>
      import('../modules/wellbeing/index').then((m) => ({
        default: m.WellbeingModule,
      }))
    ),
    searchable: true,
    description:
      'Zero-AI study relaxation tools featuring drift-free animated breathing timers (4-7-8 and box breathing), 6 exam-anxiety cards, a gentle Pomodoro study-break scheduler, and explicit non-medical disclaimer.',
  },
  {
    id: 'mnemonics',
    title: 'Formula & Concept Mnemonics Vault',
    track: 'school',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Zap',
    tier: 'B',
    scopeLabel: '60 Curated Mnemonics across Chemistry, Physics, Math, Biology & History',
    dataSource: 'mnemonics.json',
    view: React.lazy(() =>
      import('../modules/mnemonics/index').then((m) => ({
        default: m.MnemonicsModule,
      }))
    ),
    searchable: true,
    description:
      '60 curated mnemonics covering Periodic Table Groups, Reactivity Series, History Eras, Biological Classification, and Trigonometry with filters, custom generator, and practice mode.',
  },
  {
    id: 'competitive-9',
    title: 'Class 9 Competitive Exam Prep',
    track: 'school',
    classLevels: ['9'],
    icon: 'Trophy',
    tier: 'C',
    scopeLabel: '160 questions across 4 exams — Class 9',
    dataSource: 'competitive-9.json',
    view: React.lazy(() =>
      import('../modules/competitive-9/index').then((m) => ({
        default: m.Competitive9Module,
      }))
    ),
    searchable: true,
    description:
      '160 questions across NTSE, NSO, IMO, and IEO exams with worked solutions, difficulty tags, and chapter filters.',
  },
  {
    id: 'entrance-tracks',
    title: 'Entrance Exam Track Catalog',
    track: 'both',
    classLevels: ['11', '12'],
    icon: 'Target',
    tier: 'C',
    scopeLabel: '100 PYQs & Syllabus Maps across JEE, NEET, CLAT, CA Foundation',
    dataSource: 'entrance-tracks.json',
    view: React.lazy(() =>
      import('../modules/entrance-tracks/index').then((m) => ({
        default: m.EntranceTracksModule,
      }))
    ),
    searchable: true,
    description:
      'Syllabus tree maps, 25 PYQs per exam with solutions, and PYQ weightage heatmaps for JEE, NEET, CLAT, and CA Foundation.',
  },
  {
    id: 'interview-prep',
    title: 'Tech & Industry Interview Question Bank',
    track: 'college',
    classLevels: [],
    icon: 'Briefcase',
    tier: 'B',
    scopeLabel: '120 Role-Specific & STAR Behavioral Questions for SDE, Data & Analyst',
    dataSource: 'interview-prep.json',
    view: React.lazy(() =>
      import('../modules/interview-prep/index').then((m) => ({
        default: m.InterviewPrepModule,
      }))
    ),
    searchable: true,
    description:
      'Role-wise question banks for SDE, Data, and Analyst roles with STAR behavioural framework, model answers, and resume-based question generation.',
  },
  {
    id: 'daily-tasks',
    title: 'Adaptive Daily Practice Plan',
    track: 'both',
    classLevels: ['9', '10', '11', '12'],
    icon: 'CheckSquare',
    tier: 'B',
    scopeLabel: 'Structured Daily Task Checklist & Adaptive Elo Practice',
    dataSource: 'daily-tasks.json',
    view: React.lazy(() =>
      import('../modules/daily-tasks/index').then((m) => ({
        default: m.DailyTasksModule,
      }))
    ),
    searchable: true,
    description:
      'Daily task checklist with streak tracking, adaptive difficulty scaling, and progress integration.',
  },
  {
    id: 'concept-videos',
    title: '3D Animated Concept Video Lessons',
    track: 'school',
    classLevels: ['9', '10', '11', '12'],
    icon: 'Video',
    tier: 'B',
    scopeLabel: '6 pre-rendered animated video lessons across Class 10 STEM — Dual Audio (EN/HI)',
    dataSource: 'concept-videos.json',
    view: React.lazy(() =>
      import('../modules/concept-videos/index').then((m) => ({
        default: m.ConceptVideosModule,
      }))
    ),
    searchable: true,
    description:
      '6 3D animated STEM video lessons with dual English & Hindi audio, synced interactive transcript seeking, chapter markers, and Manim rendering pipeline manifest.',
  },
  {
    id: 'mock-interview',
    title: 'AI Mock Technical & Behavioral Interview Coach',
    track: 'college',
    classLevels: [],
    icon: 'Mic',
    tier: 'C',
    scopeLabel: '5-Question SDE Technical & Behavioral Practice Interview',
    dataSource: 'mock-interview.json',
    view: React.lazy(() =>
      import('../modules/mock-interview/index').then((m) => ({
        default: m.MockInterviewModule,
      }))
    ),
    searchable: true,
    description:
      '5-Question SDE practice interview with MediaRecorder audio capture, per-answer rubric feedback, filler-word counter, and exportable transcript report.',
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
