// src/app/LandingPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { REGISTRY, type ModuleConfig } from '@core/registry';
import type { Track } from '@core/types';
import type { AppShellContext } from './AppShell';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { DynamicIcon } from '@components/DynamicIcon';
import { useAuth } from '@core/auth';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Search,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  FileCheck2,
  Mic,
  Compass,
  Star,
  Award,
  BookMarked,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

interface LandingPageProps {
  currentTrack?: Track;
  onTrackChange?: (track: Track) => void;
}

export function LandingPage(props: LandingPageProps) {
  const context = useOutletContext<AppShellContext | undefined>();
  const currentTrack = props.currentTrack ?? context?.currentTrack ?? 'school';
  const onTrackChange = props.onTrackChange ?? context?.setTrack ?? (() => {});
  const { user } = useAuth();

  const [activeTrackFilter, setActiveTrackFilter] = useState<'all' | 'school' | 'college'>(currentTrack);

  useEffect(() => {
    setActiveTrackFilter(currentTrack);
  }, [currentTrack]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'tierA' | 'stem' | 'placement'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Dynamic time greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filter and search modules
  const filteredModules = useMemo(() => {
    return REGISTRY.filter((m) => {
      // 1. Track filter
      if (activeTrackFilter !== 'all') {
        if (m.track !== activeTrackFilter && m.track !== 'both') return false;
      }

      // 2. Category tag filter
      if (activeCategory === 'tierA' && m.tier !== 'A') return false;
      if (activeCategory === 'stem' && m.track !== 'school') return false;
      if (activeCategory === 'placement' && m.track !== 'college') return false;

      // 3. Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = m.description.toLowerCase().includes(q);
        const matchScope = m.scopeLabel.toLowerCase().includes(q);
        const matchClass = m.classLevels.some((cl) => cl.includes(q));
        if (!matchTitle && !matchDesc && !matchScope && !matchClass) {
          return false;
        }
      }

      return true;
    });
  }, [activeTrackFilter, activeCategory, searchQuery]);

  // Quick stats computed live from REGISTRY
  const totalModulesCount = REGISTRY.length;
  const schoolCount = REGISTRY.filter((m) => m.track === 'school' || m.track === 'both').length;
  const collegeCount = REGISTRY.filter((m) => m.track === 'college' || m.track === 'both').length;

  const handleLaunch = (module: ModuleConfig) => {
    const trackSlug = module.track === 'both' ? currentTrack : module.track;
    navigate(`/${trackSlug}/${module.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-10 pb-16">
      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-800/40">
        {/* Decorative background glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>AI-Augmented Learning Engine • {totalModulesCount} Live Modules</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {greeting},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-sky-300 to-indigo-100">
                {user?.name || 'Scholar'}.
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {user?.track === 'school' && user?.classLevel ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                  <span>Class {user.classLevel}th Student {user.stream && user.stream !== 'general' ? `• ${user.stream.toUpperCase()}` : ''}</span>
                </span>
              ) : null}
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
                High-yield curriculum intelligence, forensic exam marking schemes, and precision step-by-step walkthroughs for CBSE Class 9–12 and engineering placements.
              </p>
            </div>
          </div>

          {/* Quick Track Switcher Pills in Hero */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Explore Track:
            </span>
            <div className="inline-flex p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setActiveTrackFilter('school');
                  onTrackChange('school');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTrackFilter === 'school'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                School (9–12)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTrackFilter('college');
                  onTrackChange('college');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTrackFilter === 'college'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                College & Tech
              </button>
              <button
                type="button"
                onClick={() => setActiveTrackFilter('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTrackFilter === 'all'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Tracks ({totalModulesCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── METRIC TILES BAR ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:border-[var(--color-accent)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Live Modules</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text)] tracking-tight">
            {totalModulesCount} Modules
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            {schoolCount} School • {collegeCount} College
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Platform Integrity</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text)] tracking-tight">
            100% Tested
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            Zero broken surfaces & full offline cache
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">AI Solvers</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text)] tracking-tight">
            Step-by-Step
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            LaTeX derivations & marking criteria
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Latency</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text)] tracking-tight">
            &lt; 50ms
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            Pre-computed JSON offline content
          </p>
        </div>
      </div>

      {/* ── QUICK ACCESS SPRINT STRIP ───────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-accent)] text-white shadow-sm shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                Featured Daily Sprint: High-Yield Revision
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Recommended 15-minute drill to boost retention and problem-solving velocity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/school/question-bank')}
              className="px-3 py-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Question Bank
            </button>
            <button
              type="button"
              onClick={() => navigate('/school/mnemonics')}
              className="px-3 py-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Mnemonics
            </button>
            <button
              type="button"
              onClick={() => navigate('/college/interview-prep')}
              className="px-3 py-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
              Interview Prep
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULE DIRECTORY & INTERACTIVE CATALOG ──────────────────────── */}
      <div className="space-y-6">
        {/* Search and Category Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight flex items-center gap-2">
              <span>Interactive Module Catalog</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {filteredModules.length} Available
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Select any active module to launch its interactive exercise surface and solution generator.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by topic, chapter, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-muted)] font-semibold hover:text-[var(--color-text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-xs'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            All Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('tierA')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'tierA'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Tier-A High Priority
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('stem')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'stem'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            CBSE STEM (Class 11–12)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('placement')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'placement'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Placements & Career
          </button>
        </div>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <Search className="w-8 h-8 text-[var(--color-text-muted)] mx-auto opacity-50" />
            <h3 className="text-base font-bold text-[var(--color-text)]">No modules found</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              No active modules match "{searchQuery}". Try clearing search or selecting a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveTrackFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModules.map((module) => {
              const isSchool = module.track === 'school' || module.track === 'both';
              const isCollege = module.track === 'college';

              return (
                <Card
                  key={module.id}
                  onClick={() => handleLaunch(module)}
                  className="p-5 flex flex-col justify-between hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-200 group text-left cursor-pointer relative overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)]"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all shadow-xs shrink-0">
                          <DynamicIcon name={module.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                            {module.title}
                          </h3>
                          {module.classLevels && module.classLevels.length > 0 ? (
                            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                              Class {module.classLevels.join(', ')}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                              College & Undergrad
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge label={module.tier} variant="tier" />
                        <Badge label={module.track} variant="track" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-4 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Scope & Action Footer */}
                  <div className="pt-3.5 border-t border-[var(--color-border)] space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-medium truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{module.scopeLabel}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-[var(--color-text)] transition-colors">
                        Ready to launch
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] group-hover:translate-x-1 transition-transform">
                        Explore <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PLATFORM TRUST & ARCHITECTURE GUARANTEES ────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Built for Academic Precision & Speed
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Strict CBSE syllabus adherence, pre-computed offline content, and forensic technical rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 w-fit">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--color-text)]">Syllabus-Bounded Precision</h4>
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
              Never introduces out-of-syllabus concepts. Step-by-step marking breakdowns strictly sum to question point values.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 w-fit">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--color-text)]">Zero-Latency Local Loaders</h4>
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
              Static pre-generated JSON committed in <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">content/</code> ensures instant, reliable client-side render.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 w-fit">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--color-text)]">Live AI Deep Walkthroughs</h4>
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
              Tap "Explain" on any problem to stream LaTeX formulas, common student traps, and examiner insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
