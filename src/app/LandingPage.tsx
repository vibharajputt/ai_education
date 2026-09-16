import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { REGISTRY } from '@core/registry';
import type { Track } from '@core/types';
import type { AppShellContext } from './AppShell';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { StatTile } from '@components/StatTile';
import { DynamicIcon } from '@components/DynamicIcon';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  currentTrack?: Track;
  onTrackChange?: (track: Track) => void;
}

export function LandingPage(props: LandingPageProps) {
  const context = useOutletContext<AppShellContext | undefined>();
  const currentTrack = props.currentTrack ?? context?.currentTrack ?? 'school';
  const onTrackChange = props.onTrackChange ?? context?.setTrack ?? (() => {});

  const [activeTab, setActiveTab] = useState<'all' | 'school' | 'college'>(currentTrack);
  const navigate = useNavigate();

  const filteredModules = REGISTRY.filter((m) => {
    if (activeTab === 'all') return true;
    return m.track === activeTab || m.track === 'both';
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-border)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Day Hackathon MVP • 21-Module Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
          AI-Augmented Learning Engine
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
          High-yield, pre-computed curriculum intelligence and precision solution walk-throughs for CBSE Class 9–12 and undergraduate college success.
        </p>
      </div>

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          label="Architecture Target"
          value="21 Modules"
          subtext="Covering School & College Tracks"
          icon={<BookOpen className="w-4 h-4 text-[var(--color-accent)]" />}
        />
        <StatTile
          label="Execution Metric"
          value="0 Broken"
          subtext="Zero broken surfaces, loading & error states"
          icon={<CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />}
        />
        <StatTile
          label="Active Tracks"
          value="School & College"
          subtext="Class 9–12 + Undergrad Tech & Prep"
          icon={<GraduationCap className="w-4 h-4 text-[var(--color-accent)]" />}
        />
      </div>

      {/* Module Catalog Header & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Module Directory
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Select a module to launch its interactive study surface.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              All Tracks
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('school');
                onTrackChange('school');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'school'
                  ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              School (9–12)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('college');
                onTrackChange('college');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'college'
                  ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              College
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModules.map((module) => {
            const trackSlug = module.track === 'both' ? currentTrack : module.track;

            return (
              <Card
                key={module.id}
                onClick={() => navigate(`/${trackSlug}/${module.id}`)}
                className="p-5 flex flex-col justify-between hover:border-[var(--color-border-hover)] hover:shadow-md transition-all duration-200 group text-left cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                        <DynamicIcon name={module.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                          {module.title}
                        </h3>
                        {module.classLevels && module.classLevels.length > 0 && (
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            Class {module.classLevels.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge label={module.tier} variant="tier" />
                      <Badge label={module.track} variant="track" />
                    </div>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-4 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-[var(--color-text-muted)] truncate max-w-[260px]">
                    {module.scopeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform shrink-0">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
