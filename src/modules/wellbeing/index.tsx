import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCollection } from '@core/loaders';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import {
  Heart,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  BookOpen,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

type BreathingPattern = '478' | 'box';

interface PhaseConfig {
  name: 'Inhale' | 'Hold' | 'Exhale';
  durationSec: number;
  scaleTarget: number; // 1.0 (normal) to 1.6 (expanded)
  colorClass: string;
}

const PATTERNS: Record<BreathingPattern, { title: string; desc: string; phases: PhaseConfig[] }> = {
  '478': {
    title: '4-7-8 Deep Relaxation Breathing',
    desc: 'Inhale 4s · Hold 7s · Exhale 8s. Helps lower heart rate and reduce acute anxiety.',
    phases: [
      { name: 'Inhale', durationSec: 4, scaleTarget: 1.6, colorClass: 'text-emerald-400 border-emerald-500' },
      { name: 'Hold', durationSec: 7, scaleTarget: 1.6, colorClass: 'text-amber-400 border-amber-500' },
      { name: 'Exhale', durationSec: 8, scaleTarget: 1.0, colorClass: 'text-indigo-400 border-indigo-500' },
    ],
  },
  box: {
    title: 'Box Breathing (4-4-4-4)',
    desc: 'Inhale 4s · Hold 4s · Exhale 4s · Hold 4s. Promotes mental clarity and emotional composure.',
    phases: [
      { name: 'Inhale', durationSec: 4, scaleTarget: 1.6, colorClass: 'text-emerald-400 border-emerald-500' },
      { name: 'Hold', durationSec: 4, scaleTarget: 1.6, colorClass: 'text-amber-400 border-amber-500' },
      { name: 'Exhale', durationSec: 4, scaleTarget: 1.0, colorClass: 'text-indigo-400 border-indigo-500' },
      { name: 'Hold', durationSec: 4, scaleTarget: 1.0, colorClass: 'text-slate-400 border-slate-500' },
    ],
  },
};

export function WellbeingModule() {
  const { items, loading, error, reload } = useCollection('wellbeing.json');
  const [activeTab, setActiveTab] = useState<'breathing' | 'cards' | 'pomodoro'>('breathing');

  // Breathing States
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>('478');
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [circleScale, setCircleScale] = useState<number>(1.0);

  // Pomodoro States
  const [pomoPreset, setPomoPreset] = useState<number>(25); // 25m or 50m
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState<number>(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState<boolean>(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'break'>('focus');

  // References for drift-free requestAnimationFrame breathing loop
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number | null>(null);

  const patternObj = PATTERNS[selectedPattern];
  const activePhase = patternObj.phases[currentPhaseIndex];

  // Reset breathing timer when pattern changes
  const resetBreathing = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsBreathingRunning(false);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(PATTERNS[selectedPattern].phases[0].durationSec);
    setCircleScale(1.0);
    setCompletedCycles(0);
    startTimeRef.current = null;
    phaseStartTimeRef.current = null;
  }, [selectedPattern]);

  useEffect(() => {
    resetBreathing();
  }, [selectedPattern, resetBreathing]);

  // Drift-free animation loop using performance.now()
  useEffect(() => {
    if (!isBreathingRunning) return;

    let localPhaseIndex = currentPhaseIndex;
    let localPhaseStartTime = performance.now();
    phaseStartTimeRef.current = localPhaseStartTime;

    const tick = (now: number) => {
      const phases = PATTERNS[selectedPattern].phases;
      const curPhase = phases[localPhaseIndex];
      const elapsedPhaseMs = now - localPhaseStartTime;
      const totalPhaseMs = curPhase.durationSec * 1000;

      const remainingSec = Math.max(0, Math.ceil((totalPhaseMs - elapsedPhaseMs) / 1000));
      setPhaseSecondsLeft(remainingSec);

      // Interpolate smooth scale target
      const prevScaleTarget =
        localPhaseIndex === 0
          ? 1.0
          : phases[(localPhaseIndex - 1 + phases.length) % phases.length].scaleTarget;
      const progress = Math.min(1.0, elapsedPhaseMs / totalPhaseMs);
      const currentInterpolatedScale = prevScaleTarget + (curPhase.scaleTarget - prevScaleTarget) * progress;
      setCircleScale(currentInterpolatedScale);

      // Phase transition
      if (elapsedPhaseMs >= totalPhaseMs) {
        const nextIndex = (localPhaseIndex + 1) % phases.length;
        if (nextIndex === 0) {
          setCompletedCycles((c) => c + 1);
        }
        localPhaseIndex = nextIndex;
        localPhaseStartTime = performance.now();
        setCurrentPhaseIndex(nextIndex);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isBreathingRunning, selectedPattern]);

  // Pomodoro timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPomoRunning && pomoSecondsLeft > 0) {
      interval = setInterval(() => {
        setPomoSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPomoRunning && pomoSecondsLeft === 0) {
      if (pomoMode === 'focus') {
        setPomoMode('break');
        setPomoSecondsLeft(5 * 60); // 5 min break
      } else {
        setPomoMode('focus');
        setPomoSecondsLeft(pomoPreset * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoSecondsLeft, pomoMode, pomoPreset]);

  const handlePomoPresetChange = (mins: number) => {
    setIsPomoRunning(false);
    setPomoPreset(mins);
    setPomoMode('focus');
    setPomoSecondsLeft(mins * 60);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <StateShell status="loading" />;
  if (error) return <StateShell status="error" error={error} onRetry={reload} />;
  if (items.length === 0) return <StateShell status="empty" emptyTitle="No wellbeing content found." />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">
              Exam Wellbeing & Relaxation Hub
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Zero-AI · Non-Medical Study Relaxation & Breathing Timers
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-medium">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'breathing'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Breathing Timers
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'cards'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            6 Anxiety Cards
          </button>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'pomodoro'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Study-Break Timer
          </button>
        </div>
      </div>

      {/* ── TAB 1: DRIFT-FREE ANIMATED BREATHING TIMER ── */}
      {activeTab === 'breathing' && (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Pattern Selector */}
          <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium">
            {(['478', 'box'] as BreathingPattern[]).map((pat) => (
              <button
                key={pat}
                onClick={() => setSelectedPattern(pat)}
                className={`flex-1 py-2 rounded-lg transition-colors text-center ${
                  selectedPattern === pat
                    ? 'bg-[var(--color-accent)] text-white font-bold shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {PATTERNS[pat].title}
              </button>
            ))}
          </div>

          {/* Breathing Circle Container */}
          <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col items-center justify-center space-y-8 min-h-[380px] shadow-sm">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                {patternObj.title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                {patternObj.desc}
              </p>
            </div>

            {/* Animated Expanding/Contracting Circle (rAF powered) */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-4 transition-transform duration-75 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm shadow-inner ${activePhase.colorClass}`}
                style={{
                  transform: `scale(${circleScale})`,
                }}
              />
              <div className="relative z-10 text-center space-y-1">
                <span className="text-2xl font-extrabold uppercase tracking-widest text-white block">
                  {activePhase.name}
                </span>
                <span className="text-4xl font-black text-white font-mono block">
                  {phaseSecondsLeft}s
                </span>
              </div>
            </div>

            {/* Cycle Counter & Controls */}
            <div className="flex items-center justify-between w-full max-w-xs pt-4 border-t border-[var(--color-border)]">
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Completed: <strong className="text-[var(--color-text)]">{completedCycles} cycles</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetBreathing}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsBreathingRunning(!isBreathingRunning)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-sm ${
                    isBreathingRunning
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'
                  }`}
                >
                  {isBreathingRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Start Breathing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: 6 SCRIPTED ANXIETY CARDS ── */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const meta = item.metadata as any;
            const steps: string[] = meta?.steps || [];
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 flex flex-col justify-between hover:border-[var(--color-accent)] transition-colors shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] pb-2.5">
                    <h4 className="text-sm font-bold text-[var(--color-text)] leading-snug">
                      {meta?.title}
                    </h4>
                    <Badge label={meta?.duration || 'Guide'} variant="tier" />
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed italic">
                    {meta?.summary}
                  </p>

                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-[var(--color-accent)] uppercase tracking-wider block">
                      Action Steps
                    </span>
                    <ol className="space-y-1.5 text-xs text-[var(--color-text)] list-decimal list-inside pl-0.5">
                      {steps.map((st, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="font-normal text-[var(--color-text-muted)] pl-1">{st}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 3: STUDY-BREAK SCHEDULER (POMODORO) ── */}
      {activeTab === 'pomodoro' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col items-center justify-center space-y-6 shadow-sm">
            <div className="text-center space-y-1">
              <Badge
                label={pomoMode === 'focus' ? 'Gentle Focus Block' : 'Calm Rest Break'}
                variant="tier"
              />
              <h3 className="text-base font-bold text-[var(--color-text)] mt-2">
                Study-Break Scheduler
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                A non-gamified, balanced routine to protect mental stamina.
              </p>
            </div>

            {/* Presets Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePomoPresetChange(25)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pomoPreset === 25
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                25m Focus / 5m Break
              </button>
              <button
                onClick={() => handlePomoPresetChange(50)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pomoPreset === 50
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                50m Focus / 10m Break
              </button>
            </div>

            {/* Timer Display */}
            <div className="py-6 px-10 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono">
              <span className="text-5xl font-black text-emerald-400 tracking-wider">
                {formatTime(pomoSecondsLeft)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setPomoSecondsLeft(pomoPreset * 60);
                  setPomoMode('focus');
                }}
                className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-sm ${
                  isPomoRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'
                }`}
              >
                {isPomoRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Session
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Focus Block
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Non-Medical Disclaimer Footer (Explicit rule in prompt & AGENTS.md) */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 space-y-1">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
          <ShieldAlert className="w-4 h-4 shrink-0" /> Important Scope & Support Notice
        </div>
        <p className="text-slate-300 leading-relaxed">
          This module is strictly for study-skills and relaxation guidance. It contains <strong>no medical claims</strong>, no AI diagnoses, and no mental-health assessments. If you are experiencing distress beyond ordinary exam stress, please reach out to a trusted adult, school counsellor, or certified healthcare professional.
        </p>
      </div>
    </div>
  );
}
