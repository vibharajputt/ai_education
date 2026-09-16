import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { REGISTRY } from '@core/registry';
import type { Track } from '@core/types';
import { Badge } from '@components/Badge';
import { DynamicIcon } from '@components/DynamicIcon';
import { BottomSheet } from '@components/BottomSheet';
import { Home, Layers, School, GraduationCap } from 'lucide-react';

interface BottomNavProps {
  currentTrack: Track;
  onTrackChange: (track: Track) => void;
}

export function BottomNav({ currentTrack, onTrackChange }: BottomNavProps) {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredModules = REGISTRY.filter(
    (m) => m.track === currentTrack || m.track === 'both'
  );

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--color-surface)] border-t border-[var(--color-border)] z-40 flex items-center justify-around px-2 shadow-lg"
      >
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              isActive && location.pathname === '/'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        {/* Modules BottomSheet Trigger */}
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            location.pathname !== '/'
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Modules ({filteredModules.length})</span>
        </button>

        {/* Track Switcher Button */}
        <button
          type="button"
          onClick={() => onTrackChange(currentTrack === 'school' ? 'college' : 'school')}
          className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {currentTrack === 'school' ? (
            <School className="w-5 h-5 text-[var(--color-accent)]" />
          ) : (
            <GraduationCap className="w-5 h-5 text-[var(--color-accent)]" />
          )}
          <span className="capitalize">{currentTrack}</span>
        </button>
      </nav>

      {/* Module Selector Bottom Sheet */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={`Modules (${currentTrack.toUpperCase()})`}
      >
        <div className="space-y-2 pb-6">
          {filteredModules.map((module) => {
            const path = `/${currentTrack}/${module.id}`;
            const isActive = location.pathname === path;

            return (
              <NavLink
                key={module.id}
                to={path}
                onClick={() => setIsSheetOpen(false)}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <div className="mt-0.5 text-[var(--color-accent)] shrink-0">
                  <DynamicIcon name={module.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-[var(--color-text)] truncate">
                      {module.title}
                    </span>
                    <Badge label={module.tier} variant="tier" />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                    {module.scopeLabel}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
