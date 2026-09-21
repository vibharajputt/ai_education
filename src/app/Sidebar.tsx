// src/app/Sidebar.tsx
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { REGISTRY, type ModuleConfig } from '@core/registry';
import type { Track } from '@core/types';
import { DynamicIcon } from '@components/DynamicIcon';
import {
  GraduationCap,
  School,
  Sparkles,
  Flame,
  Brain,
  BarChart3,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  currentTrack: Track;
  onTrackChange: (track: Track) => void;
  className?: string;
}

interface NavGroup {
  title: string;
  icon: React.ReactNode;
  moduleIds: string[];
}

export function Sidebar({
  currentTrack,
  onTrackChange,
  className = '',
}: SidebarProps) {
  const location = useLocation();

  const filteredModules = useMemo(() => {
    return REGISTRY.filter(
      (m) => m.track === currentTrack || m.track === 'both'
    );
  }, [currentTrack]);

  // Section Groupings for high visual clarity
  const groups: NavGroup[] = useMemo(() => {
    if (currentTrack === 'school') {
      return [
        {
          title: 'Signature Exam Engines',
          icon: <Flame className="w-3.5 h-3.5 text-amber-500" />,
          moduleIds: ['split-view', 'pyq-analyzer', 'syllabus-plan'],
        },
        {
          title: 'Practice & Diagnostics',
          icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />,
          moduleIds: ['sheet-generator', 'quiz', 'progress-report', 'weak-topics'],
        },
        {
          title: 'Concept & Revision Anchors',
          icon: <Brain className="w-3.5 h-3.5 text-indigo-500" />,
          moduleIds: ['question-bank', 'mnemonics', 'viva-practice', 'flashcards', 'concept-maps', 'chapter-summaries'],
        },
      ];
    }

    return [
      {
        title: 'Career & Placements',
        icon: <Compass className="w-3.5 h-3.5 text-purple-500" />,
        moduleIds: ['interview-prep', 'resume-analyzer', 'career-path'],
      },
      {
        title: 'Study & Skill Analytics',
        icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />,
        moduleIds: ['syllabus-plan', 'sheet-generator', 'quiz', 'progress-report', 'weak-topics'],
      },
    ];
  }, [currentTrack]);

  const moduleMap = useMemo(() => {
    const map = new Map<string, ModuleConfig>();
    for (const m of filteredModules) {
      map.set(m.id, m);
    }
    return map;
  }, [filteredModules]);

  return (
    <aside
      aria-label="Module Navigation Sidebar"
      className={`w-72 h-[calc(100vh-3.5rem)] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 hidden md:flex ${className}`}
    >
      {/* ── Top Track Switcher Pill ── */}
      <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <div
          role="tablist"
          aria-label="Audience Track"
          className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentTrack === 'school'}
            onClick={() => onTrackChange('school')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTrack === 'school'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <School className="w-4 h-4" />
            <span>School (9–12)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentTrack === 'college'}
            onClick={() => onTrackChange('college')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTrack === 'college'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>College (Tech)</span>
          </button>
        </div>
      </div>

      {/* ── Grouped Navigation Items ── */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {groups.map((group, gIdx) => {
          const groupModules = group.moduleIds
            .map((id) => moduleMap.get(id))
            .filter((m): m is ModuleConfig => m !== undefined);

          if (groupModules.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1.5">
              {/* Attractive Section Header */}
              <div className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {group.icon}
                  {group.title}
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)]/70">
                  {groupModules.length}
                </span>
              </div>

              {/* Module Links */}
              <div className="space-y-1">
                {groupModules.map((module) => {
                  const path = `/${currentTrack}/${module.id}`;
                  const isActive = location.pathname === path;

                  return (
                    <NavLink
                      key={module.id}
                      to={path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'text-[var(--color-text)] border border-transparent hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)]'
                      }`}
                    >
                      {/* Icon with gradient badge on active */}
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                        }`}
                      >
                        <DynamicIcon name={module.icon} className="w-3.5 h-3.5" />
                      </div>

                      {/* Module Title & Clean Subtitle */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-bold leading-snug">
                            {module.title}
                          </span>
                          {module.tier === 'A' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5 leading-tight font-normal">
                          {module.scopeLabel}
                        </p>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
