// src/app/Sidebar.tsx
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { REGISTRY, type ModuleConfig } from '@core/registry';
import type { Track } from '@core/types';
import { DynamicIcon } from '@components/DynamicIcon';
import {
  GraduationCap,
  School,
  Flame,
  Atom,
  Brain,
  BarChart3,
  Compass,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentTrack: Track;
  onTrackChange: (track: Track) => void;
  className?: string;
}

interface NavGroup {
  id: string;
  title: string;
  badgeText: string;
  icon: React.ReactNode;
  headerTheme: {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
  };
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

  // Section Groupings with rich visual themes
  const groups: NavGroup[] = useMemo(() => {
    if (currentTrack === 'school') {
      return [
        {
          id: 'exam-engines',
          title: 'Signature Exam Engines',
          badgeText: 'Board Prep',
          icon: <Flame className="w-3.5 h-3.5 text-amber-500" />,
          headerTheme: {
            bg: 'bg-amber-500/10 dark:bg-amber-500/15',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-500/20',
            iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
          },
          moduleIds: ['split-view', 'pyq-analyzer', 'syllabus-plan'],
        },
        {
          id: 'visual-stem',
          title: 'Visual STEM & Lab Engines',
          badgeText: 'Interactive',
          icon: <Atom className="w-3.5 h-3.5 text-cyan-500" />,
          headerTheme: {
            bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
            text: 'text-cyan-700 dark:text-cyan-300',
            border: 'border-cyan-500/20',
            iconBg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
          },
          moduleIds: ['chemistry-3d', 'concept-videos', 'mnemonics', 'viva-practice'],
        },
        {
          id: 'concept-anchors',
          title: 'Concept & Revision Anchors',
          badgeText: 'High Retention',
          icon: <Brain className="w-3.5 h-3.5 text-indigo-500" />,
          headerTheme: {
            bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
            text: 'text-indigo-700 dark:text-indigo-300',
            border: 'border-indigo-500/20',
            iconBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
          },
          moduleIds: ['question-bank', 'flashcards', 'concept-maps', 'chapter-summaries'],
        },
        {
          id: 'practice-diagnostics',
          title: 'Practice & Diagnostics',
          badgeText: 'Self-Test',
          icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />,
          headerTheme: {
            bg: 'bg-blue-500/10 dark:bg-blue-500/15',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-500/20',
            iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
          },
          moduleIds: ['sheet-generator', 'quiz', 'progress-report', 'weak-topics'],
        },
      ];
    }

    return [
      {
        id: 'career-placements',
        title: 'Career & Placements',
        badgeText: 'Industry Ready',
        icon: <Compass className="w-3.5 h-3.5 text-purple-500" />,
        headerTheme: {
          bg: 'bg-purple-500/10 dark:bg-purple-500/15',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-500/20',
          iconBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
        },
        moduleIds: ['resume-analyzer', 'interview-prep', 'career-path'],
      },
      {
        id: 'skill-analytics',
        title: 'Study & Skill Analytics',
        badgeText: 'Engineering Track',
        icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />,
        headerTheme: {
          bg: 'bg-blue-500/10 dark:bg-blue-500/15',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-500/20',
          iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
        },
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

  // Helper for dynamic module badges
  const getModuleBadge = (module: ModuleConfig) => {
    if (module.id === 'split-view' || module.id === 'pyq-analyzer' || module.id === 'resume-analyzer') {
      return {
        text: 'PRO AI',
        cls: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-xs',
      };
    }
    if (module.id === 'chemistry-3d') {
      return {
        text: '3D LAB',
        cls: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-xs',
      };
    }
    if (module.id === 'concept-videos') {
      return {
        text: 'ANIMATED',
        cls: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-xs',
      };
    }
    if (module.tier === 'A') {
      return {
        text: 'HIGH YIELD',
        cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold',
      };
    }
    return null;
  };

  return (
    <aside
      aria-label="Module Navigation Sidebar"
      className={`w-72 h-[calc(100vh-3.5rem)] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 hidden md:flex select-none ${className}`}
    >
      {/* ── Top Track Switcher Pill ── */}
      <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <div
          role="tablist"
          aria-label="Audience Track"
          className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)] shadow-inner"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentTrack === 'school'}
            onClick={() => onTrackChange('school')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              currentTrack === 'school'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
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
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              currentTrack === 'college'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>College (Tech)</span>
          </button>
        </div>
      </div>

      {/* ── Grouped Navigation Items ── */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
        {groups.map((group) => {
          const groupModules = group.moduleIds
            .map((id) => moduleMap.get(id))
            .filter((m): m is ModuleConfig => m !== undefined);

          if (groupModules.length === 0) return null;

          return (
            <div key={group.id} className="space-y-2">
              {/* Attractive Category Header Pill */}
              <div
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-wider flex items-center justify-between transition-colors ${group.headerTheme.bg} ${group.headerTheme.text} ${group.headerTheme.border}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${group.headerTheme.iconBg}`}>
                    {group.icon}
                  </div>
                  <span className="font-extrabold">{group.title}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-xs">
                  {groupModules.length}
                </span>
              </div>

              {/* Module Item Cards */}
              <div className="space-y-1 pl-1">
                {groupModules.map((module) => {
                  const path = `/${currentTrack}/${module.id}`;
                  const isActive = location.pathname === path;
                  const badge = getModuleBadge(module);

                  return (
                    <NavLink
                      key={module.id}
                      to={path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex items-start gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'text-[var(--color-text)] border border-transparent hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)] hover:translate-x-0.5'
                      }`}
                    >
                      {/* Active Left Indicator Pill */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                      )}

                      {/* Icon container */}
                      <div
                        className={`p-2 rounded-lg shrink-0 transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30 scale-105'
                            : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:bg-[var(--color-surface-raised)]'
                        }`}
                      >
                        <DynamicIcon name={module.icon} className="w-4 h-4" />
                      </div>

                      {/* Module Title & Scope Subtitle */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate text-xs font-bold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {module.title}
                          </span>
                          {badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider shrink-0 ${badge.cls}`}
                            >
                              {badge.text}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5 leading-tight font-medium opacity-80">
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

      {/* ── Bottom AI Engine Status Card ── */}
      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-2.5 h-2.5 flex items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <div className="truncate">
              <p className="text-[11px] font-black text-[var(--color-text)] truncate flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 inline" />
                Google AI Active
              </p>
              <p className="text-[9px] font-medium text-[var(--color-text-muted)] truncate">
                Gemini 2.5 Flash Engine Ready
              </p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
}
