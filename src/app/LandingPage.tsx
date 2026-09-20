import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { REGISTRY } from '@core/registry';
import type { Track } from '@core/types';
import type { AppShellContext } from './AppShell';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { StatTile } from '@components/StatTile';
import { DynamicIcon } from '@components/DynamicIcon';
import { useProgressStore } from '@core/progress';
import {
  seedDemoData,
  clearDemoData,
  isDemoDataLoaded,
  DEMO_STREAM_KEY,
  DEMO_LAST_VISITED_KEY,
} from '@core/demoSeed';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Flame,
  Clock,
  AlertTriangle,
  RotateCcw,
  Play,
  Brain,
  Target,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

interface LandingPageProps {
  currentTrack?: Track;
  onTrackChange?: (track: Track) => void;
}

interface LastVisitedModule {
  track: string;
  id: string;
  title: string;
  timestamp: number;
}

interface StreamAdvisorResult {
  recommendedStream: string;
  runnerUpStream?: string;
  confidenceBand: string;
  targetEntranceExam: string;
  timestamp: number;
}

export function LandingPage(props: LandingPageProps) {
  const context = useOutletContext<AppShellContext | undefined>();
  const currentTrack = props.currentTrack ?? context?.currentTrack ?? 'school';
  const onTrackChange = props.onTrackChange ?? context?.setTrack ?? (() => {});

  const [activeTab, setActiveTab] = useState<'all' | 'school' | 'college'>(currentTrack);
  const navigate = useNavigate();
  const location = useLocation();

  const progress = useProgressStore();

  const [lastVisited, setLastVisited] = useState<LastVisitedModule | null>(null);
  const [streamResult, setStreamResult] = useState<StreamAdvisorResult | null>(null);
  const [demoLoaded, setDemoLoaded] = useState<boolean>(false);

  // Auto-seed on ?demo=1 query param OR first-time visit if empty
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasDemoParam = params.get('demo') === '1';

    if (hasDemoParam || !isDemoDataLoaded()) {
      seedDemoData();
      setDemoLoaded(true);
    } else {
      setDemoLoaded(isDemoDataLoaded());
    }
  }, [location.search]);

  // Load last visited and stream result from localStorage
  const refreshStorageData = () => {
    try {
      const rawLast = localStorage.getItem(DEMO_LAST_VISITED_KEY);
      if (rawLast) setLastVisited(JSON.parse(rawLast));
      else setLastVisited(null);

      const rawStream = localStorage.getItem(DEMO_STREAM_KEY);
      if (rawStream) setStreamResult(JSON.parse(rawStream));
      else setStreamResult(null);
    } catch {
      // Ignore JSON parse errors
    }
  };

  useEffect(() => {
    refreshStorageData();

    const handleStorageUpdate = () => {
      refreshStorageData();
      setDemoLoaded(isDemoDataLoaded());
    };

    window.addEventListener('progress_store_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('progress_store_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleSeedDemo = () => {
    seedDemoData();
    setDemoLoaded(true);
    refreshStorageData();
  };

  const handleResetData = () => {
    clearDemoData();
    setDemoLoaded(false);
    setLastVisited(null);
    setStreamResult(null);
  };

  const filteredModules = REGISTRY.filter((m) => {
    if (activeTab === 'all') return true;
    return m.track === activeTab || m.track === 'both';
  });

  // Extract Weak Concepts from Progress Store (Top 3 lowest Elo or status='weak')
  const weakConcepts = progress.conceptMastery
    .filter((c) => c.status === 'weak' || c.elo < 1200)
    .slice(0, 3);

  // If no weak concepts found, pick 3 lowest Elo concepts or default fallbacks
  const topWeakConcepts =
    weakConcepts.length > 0
      ? weakConcepts
      : progress.conceptMastery.slice(-3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-border)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Augmented Education Platform • 21 Integrated Modules</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
          Precision Learning & Exam Mastery Engine
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
          Integrated curriculum intelligence for CBSE Class 9–12 and undergraduate success with automated SWOT analytics and spaced repetition.
        </p>

        {/* Demo Seed Controls Bar */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSeedDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-accent)] text-white hover:opacity-90 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {demoLoaded ? 'Reload Demo Profile (?demo=1)' : 'Load Demo Data (?demo=1)'}
          </button>
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Top Banner Grid: Continue Where You Left Off & Stream Advisor Surfaced Track */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Continue Where You Left Off Card */}
        {lastVisited ? (
          <Card className="p-5 border-l-4 border-l-[var(--color-accent)] bg-gradient-to-r from-[var(--color-accent-subtle)]/30 to-transparent flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-accent)] flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Continue Where You Left Off
                </span>
                <Badge label={lastVisited.track} variant="track" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                {lastVisited.title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Resume your last active session in this module.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate(`/${lastVisited.track}/${lastVisited.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity shadow-xs"
              >
                Resume Module <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-5 border-l-4 border-l-[var(--color-border)] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Quick Start
              </span>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Start Your Practice Session
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Select any module below to begin tracking your mastery and FSRS revision schedule.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate(`/${currentTrack}/quiz`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                Launch Daily Quiz <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        )}

        {/* Stream Advisor Entrance Track Surfaced Card */}
        {streamResult ? (
          <Card className="p-5 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Stream Advisor Recommendation
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {streamResult.confidenceBand}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                {streamResult.recommendedStream}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Target Entrance Exam: <strong className="text-[var(--color-text)]">{streamResult.targetEntranceExam}</strong>
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate(`/${currentTrack}/entrance-tracks`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Explore {streamResult.targetEntranceExam} Track <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-5 border-l-4 border-l-[var(--color-accent)] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-accent)] flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                Stream & Career Guidance
              </span>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Class 10 Stream Advisor
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Take the 15-question deterministic assessment to discover your optimal stream & career alignment.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate('/school/stream-advisor')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
              >
                Take Assessment <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Overview Stat Tiles Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          label="Active Study Streak"
          value={`${progress.streakStats.currentStreak} Days`}
          subtext={`Max streak: ${progress.streakStats.maxStreak} days`}
          icon={<Flame className="w-4 h-4 text-amber-500 fill-amber-500" />}
        />
        <StatTile
          label="FSRS Revisions Due"
          value={`${progress.dueItems.length} Items`}
          subtext="Spaced repetition review queue"
          icon={<Clock className="w-4 h-4 text-[var(--color-accent)]" />}
        />
        <StatTile
          label="Overall Mastery Score"
          value={`${progress.swotAnalysis.overallAccuracyPct}%`}
          subtext={`${progress.swotAnalysis.masteredConceptsCount} concepts mastered`}
          icon={<GraduationCap className="w-4 h-4 text-[var(--color-success)]" />}
        />
      </div>

      {/* Top 3 Weak Concepts & Remediation Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Top Priority Weak Concepts
            </h2>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            Auto-identified via Elo rating drops
          </span>
        </div>

        {topWeakConcepts.length === 0 ? (
          <Card className="p-4 text-center text-xs text-[var(--color-text-muted)]">
            No weak concepts detected! Keep practicing in Quiz or Practice modules to update concept Elo ratings.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topWeakConcepts.map((concept) => (
              <Card key={concept.conceptTag} className="p-4 space-y-3 border-l-4 border-l-amber-500">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-text)]">
                      {concept.conceptTag}
                    </h4>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      Elo Rating: {concept.elo} • Accuracy: {concept.accuracyPct}%
                    </span>
                  </div>
                  <Badge label="Weak" variant="tier" />
                </div>

                {/* Direct Remediation Action Buttons */}
                <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/${currentTrack}/quiz?concept=${encodeURIComponent(concept.conceptTag)}`
                      )
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)] hover:text-white text-[11px] font-semibold text-[var(--color-text)] transition-colors border border-[var(--color-border)]"
                  >
                    <Target className="w-3 h-3" /> Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/${currentTrack}/mnemonics?search=${encodeURIComponent(concept.conceptTag)}`
                      )
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)] hover:text-white text-[11px] font-semibold text-[var(--color-text)] transition-colors border border-[var(--color-border)]"
                  >
                    <Brain className="w-3 h-3" /> Mnemonics
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/${currentTrack}/syllabus-plan`)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)] hover:text-white text-[11px] font-semibold text-[var(--color-text)] transition-colors border border-[var(--color-border)]"
                  >
                    <Calendar className="w-3 h-3" /> Plan
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Module Catalog Header & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              21-Module Suite Catalog
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Select any module surface to launch interactive study features.
            </p>
          </div>

          {/* Filter Pills / Track Switcher */}
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
              All Tracks (21)
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
              School (Class 9–12)
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
              College Track
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
