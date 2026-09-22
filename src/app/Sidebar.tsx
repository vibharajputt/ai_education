// src/app/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { REGISTRY } from '@core/registry';
import type { Track } from '@core/types';
import { Badge } from '@components/Badge';
import { DynamicIcon } from '@components/DynamicIcon';
import { GraduationCap, School } from 'lucide-react';

interface SidebarProps {
  currentTrack: Track;
  onTrackChange: (track: Track) => void;
  className?: string;
}

export function Sidebar({
  currentTrack,
  onTrackChange,
  className = '',
}: SidebarProps) {
  const location = useLocation();

  const filteredModules = REGISTRY.filter(
    (m) => m.track === currentTrack || m.track === 'both'
  );

  return (
    <aside
      aria-label="Module Navigation Sidebar"
      className={`w-64 h-full flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 hidden md:flex overflow-hidden ${className}`}
    >
      {/* Track Switcher */}
      <div className="p-3 border-b border-[var(--color-border)]">
        <div
          role="tablist"
          aria-label="Audience Track"
          className="grid grid-cols-2 gap-1 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentTrack === 'school'}
            onClick={() => onTrackChange('school')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              currentTrack === 'school'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>School</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentTrack === 'college'}
            onClick={() => onTrackChange('college')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              currentTrack === 'college'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>College</span>
          </button>
        </div>
      </div>

      {/* Modules List Header */}
      <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
        <span>Active Modules ({filteredModules.length})</span>
        <span className="text-[10px] font-semibold normal-case px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
          {currentTrack === 'school' ? 'Class 9–12' : 'Undergrad Tech'}
        </span>
      </div>

      {/* Modules List */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filteredModules.map((module) => {
          const path = `/${currentTrack}/${module.id}`;
          const isActive = location.pathname === path;

          return (
            <NavLink
              key={module.id}
              to={path}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold shadow-xs border-l-2 border-l-[var(--color-accent)]'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <div
                className={`mt-0.5 shrink-0 ${
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                }`}
              >
                <DynamicIcon name={module.icon} className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="truncate">{module.title}</span>
                  <Badge label={module.tier} variant="tier" />
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5 font-normal">
                  {module.scopeLabel}
                </p>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
