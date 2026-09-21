// src/app/HomePage.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { REGISTRY, type ModuleConfig } from '@core/registry';
import { useTheme } from './useTheme';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Search,
  Zap,
  Layers,
  FileCheck2,
  Mic,
  Compass,
  Star,
  Award,
  ShieldCheck,
  Sun,
  Moon,
  ChevronRight,
  Cpu,
  BrainCircuit,
  Calculator,
  Flame,
  LayoutDashboard,
  Home,
  ExternalLink,
  User as UserIcon,
} from 'lucide-react';
import { DynamicIcon } from '@components/DynamicIcon';
import { Badge } from '@components/Badge';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { useAuth } from '@core/auth';

export function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [activeTrack, setActiveTrack] = useState<'all' | 'school' | 'college'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoStep, setDemoStep] = useState<number>(0);

  const filteredModules = useMemo(() => {
    return REGISTRY.filter((m) => {
      if (activeTrack !== 'all' && m.track !== activeTrack && m.track !== 'both') {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.scopeLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTrack, searchQuery]);

  const schoolModules = REGISTRY.filter((m) => m.track === 'school' || m.track === 'both');
  const collegeModules = REGISTRY.filter((m) => m.track === 'college' || m.track === 'both');

  const demoSteps = [
    {
      title: 'Problem Statement',
      badge: 'CBSE 12th Board • 3 Marks',
      content:
        'A projectile is fired with velocity $v_0$ at angle $\\theta$ with horizontal. Derive the mathematical expression for the horizontal range $R$ and determine the condition for maximum range.',
    },
    {
      title: 'Step 1: Kinematic Equations',
      badge: 'Step 1 of 3 (1 Mark)',
      content:
        'Time of flight is determined by vertical motion:\n$$T = \\frac{2v_0 \\sin\\theta}{g}$$\nHorizontal displacement with zero acceleration:\n$$R = (v_0 \\cos\\theta) \\cdot T = \\frac{2v_0^2 \\sin\\theta \\cos\\theta}{g}$$',
    },
    {
      title: 'Step 2: Trigonometric Simplification',
      badge: 'Step 2 of 3 (1 Mark)',
      content:
        'Using the double-angle identity $2\\sin\\theta\\cos\\theta = \\sin 2\\theta$:\n$$R = \\frac{v_0^2 \\sin 2\\theta}{g}$$\nFor maximum range, $\\sin 2\\theta = 1 \\implies 2\\theta = 90^\\circ \\implies \\theta = 45^\\circ$.',
    },
    {
      title: 'Step 3: Examiner Marking Breakdown',
      badge: 'Step 3 of 3 (1 Mark)',
      content:
        '• **0.5 Mark**: Correct derivation of time of flight $T$.\n• **1.0 Mark**: Setting up horizontal range relation.\n• **1.0 Mark**: Trigonometric formulation $R = \\frac{v_0^2\\sin 2\\theta}{g}$.\n• **0.5 Mark**: Final deduction for $\\theta = 45^\\circ$ ($R_{\\max} = v_0^2/g$).',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors antialiased selection:bg-indigo-500 selection:text-white">
      {/* ── TOP PUBLIC NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand / Logo & Navigation Pills */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--color-text)] flex items-center gap-1.5">
                  Ai EduEngine
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    MVP
                  </span>
                </span>
              </div>
            </Link>

            {/* Top Navigation Bar Tabs */}
            <nav aria-label="Main Navigation" className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs border border-[var(--color-border)]"
              >
                <Home className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden xs:inline sm:inline">Home Website</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="hidden xs:inline sm:inline">Dashboard Overview</span>
              </Link>
            </nav>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--color-text-muted)]">
            <a href="#tracks" className="hover:text-[var(--color-accent)] transition-colors">
              Tracks
            </a>
            <a href="#interactive-demo" className="hover:text-[var(--color-accent)] transition-colors">
              Live AI Demo
            </a>
            <a href="#modules-catalog" className="hover:text-[var(--color-accent)] transition-colors">
              Catalog ({REGISTRY.length} Modules)
            </a>
            <a href="#architecture" className="hover:text-[var(--color-accent)] transition-colors">
              Architecture
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all"
                >
                  <span className="text-sm">{user.avatar || '🎓'}</span>
                  <span className="text-xs font-bold text-[var(--color-text)]">{user.name}</span>
                  {user.track === 'school' && user.classLevel && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      Class {user.classLevel}th
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Launch Dashboard Button */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Go to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[var(--color-border)]">
        {/* Ambient Gradient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-xs backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              <span>14 Live Curriculum Modules • 100% Offline Pre-Computed Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--color-text)] leading-[1.15]">
              Master STEM & Placements with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500">
                AI Precision.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--color-text-muted)] font-normal leading-relaxed max-w-2xl mx-auto">
              Syllabus-bounded exam solutions for <strong>CBSE Class 9–12</strong> and forensic interview coaching for <strong>College Tech Placements</strong>. Zero latency, zero guesswork.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#modules-catalog"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text)] transition-all shadow-xs hover:border-[var(--color-accent)]"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Explore All 14 Modules</span>
              </a>
            </div>

            {/* Platform Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)] font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                CBSE Syllabus Bounded
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                LaTeX Mathematical Derivations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Under 50ms Offline Load Time
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE INTERACTIVE PREVIEW PLAYGROUND ──────────────────────────── */}
      <section id="interactive-demo" className="py-16 sm:py-24 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Live AI Solution Engine
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
              Experience how our syllabus-bounded engine breaks down complex problems into verifiable marking points.
            </p>
          </div>

          {/* Interactive Stepper Card */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl overflow-hidden">
            {/* Header / Tabs */}
            <div className="p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-bold text-[var(--color-text)]">
                  Physics Class 12 • Kinematics & Range
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {demoSteps[demoStep].badge}
              </span>
            </div>

            {/* Stepper Navigation */}
            <div className="grid grid-cols-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold">
              {demoSteps.map((step, idx) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setDemoStep(idx)}
                  className={`p-3 text-center transition-colors border-r last:border-r-0 border-[var(--color-border)] ${
                    demoStep === idx
                      ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold border-b-2 border-b-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span className="hidden sm:inline">Step {idx + 1}: </span>
                  {step.title.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 min-h-[220px] flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                  {demoSteps[demoStep].title}
                </h3>
                <div className="text-sm sm:text-base text-[var(--color-text)] leading-relaxed">
                  <MarkdownRenderer content={demoSteps[demoStep].content} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  disabled={demoStep === 0}
                  onClick={() => setDemoStep((p) => Math.max(0, p - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--color-border)] disabled:opacity-30 hover:bg-[var(--color-surface-hover)] transition-all"
                >
                  ← Previous Step
                </button>
                <div className="text-xs text-[var(--color-text-muted)] font-medium">
                  {demoStep + 1} of {demoSteps.length}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    demoStep < demoSteps.length - 1
                      ? setDemoStep((p) => p + 1)
                      : navigate('/school/question-bank')
                  }
                  className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:bg-[var(--color-accent-hover)] transition-all flex items-center gap-1.5"
                >
                  {demoStep < demoSteps.length - 1 ? (
                    <>
                      <span>Next Step</span>
                      <span>→</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Question Bank</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRACKS SHOWCASE ─────────────────────────────────────────────── */}
      <section id="tracks" className="py-16 sm:py-24 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Dual-Track Learning Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
              Specialized engines engineered specifically for secondary school boards and undergraduate careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* School Track Card */}
            <div className="p-8 rounded-3xl bg-[var(--color-surface)] border-2 border-blue-500/20 hover:border-blue-500/50 transition-all shadow-md space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Class 9–12
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--color-text)]">
                  School Track
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Tailored specifically for CBSE & State STEM curriculums (Physics, Chemistry, Math, Biology). Includes formula memory anchors, lab practical viva simulators, and chapter cheat sheets.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Adaptive Question Bank & Marking Criteria</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>High-Yield Formula Mnemonics (FONClBrISCCH, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Lab Viva Coach & Examiner Trap Detector</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>One-Page Ultra-Dense Chapter Blueprint Summaries</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTrack('school');
                  navigate('/school/question-bank');
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>Launch School Track ({schoolModules.length} Modules)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* College Track Card */}
            <div className="p-8 rounded-3xl bg-[var(--color-surface)] border-2 border-purple-500/20 hover:border-purple-500/50 transition-all shadow-md space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    Undergrad & Tech
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--color-text)]">
                  College & Placement Track
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Engineered for engineering students preparing for technical interviews, campus placements, and software engineering roles with real-time feedback.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>System Design & DSA Technical Interview Scenarios</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>Forensic Resume Auditor with Line-by-Line Rewrites</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>Engineering Career Milestone & Skill Trees</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>Campus Placement Quantitative & Reasoning Drills</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTrack('college');
                  navigate('/college/interview-prep');
                }}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <span>Launch College Track ({collegeModules.length} Modules)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL 14 MODULES INTERACTIVE DIRECTORY ────────────────────────── */}
      <section id="modules-catalog" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <Award className="w-3.5 h-3.5" />
              <span>Full Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              All 14 Available Learning Modules
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
              Click any module card below to launch its interactive study environment.
            </p>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Track Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setActiveTrack('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTrack === 'all'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                All ({REGISTRY.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTrack('school')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTrack === 'school'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                School
              </button>
              <button
                type="button"
                onClick={() => setActiveTrack('college')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTrack === 'college'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                College
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((module) => {
            const trackSlug = module.track === 'both' ? 'school' : module.track;

            return (
              <div
                key={module.id}
                onClick={() => navigate(`/${trackSlug}/${module.id}`)}
                className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all shadow-xs">
                        <DynamicIcon name={module.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                          {module.title}
                        </h4>
                        <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                          {module.classLevels.length > 0
                            ? `Class ${module.classLevels.join(', ')}`
                            : 'College Placement'}
                        </span>
                      </div>
                    </div>
                    <Badge label={module.tier} variant="tier" />
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-[var(--color-text-muted)] truncate max-w-[200px]">
                    {module.scopeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[var(--color-accent)] group-hover:translate-x-1 transition-transform shrink-0">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ARCHITECTURAL PILLARS ────────────────────────────────────────── */}
      <section id="architecture" className="py-16 sm:py-20 bg-[var(--color-surface-subtle)] border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Engineering Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
              Designed according to strict AGENTS.md non-negotiable standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 w-fit">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">Static Content Model</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                4 canonical core types (Question, Concept, Mnemonic, Tip) validated strictly with Zod schemas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 w-fit">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">Deterministic Pre-computation</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                All statistics and study roadmaps are generated offline with disk caching, ensuring zero runtime hallucination.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">Zero Broken Surfaces</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Every single module implements verified Loading, Empty, and Error state shells with retry mechanisms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 w-fit">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">LaTeX Mathematical Engine</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Native KaTeX rendering for complex chemical formulas, calculus derivations, and quantum equations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION FOOTER ────────────────────────────────────────── */}
      <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-lg text-[var(--color-text)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Ai EduEngine</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                AI-Augmented Education Platform • CBSE Class 9–12 & College Placements
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch Student Dashboard</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
            <p>© 2026 Ai EduEngine. Built for High-Impact Learning.</p>
            <div className="flex items-center gap-6">
              <a href="#tracks" className="hover:text-[var(--color-text)] transition-colors">
                Tracks
              </a>
              <a href="#modules-catalog" className="hover:text-[var(--color-text)] transition-colors">
                Catalog
              </a>
              <Link to="/dashboard" className="hover:text-[var(--color-text)] transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
