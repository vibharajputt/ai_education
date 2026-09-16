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
