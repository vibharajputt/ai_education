// src/modules/quiz/components/QuizSetup.tsx
import React from 'react';
import type { QuizMode, QuizConfigState } from '../types';
import type { Difficulty } from '@core';
import { Play, Calendar, Zap, Award, Sliders, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

interface QuizSetupProps {
  config: QuizConfigState;
  availableChapters: string[];
  onChange: (updated: QuizConfigState) => void;
  onStart: () => void;
  totalQuestionsAvailable: number;
}

export function QuizSetup({
  config,
  availableChapters,
  onChange,
  onStart,
  totalQuestionsAvailable,
}: QuizSetupProps) {
  const modes: Array<{
    id: QuizMode;
    label: string;
    count: number;
    timeMinutes: number;
    icon: any;
    desc: string;
    badge: string;
  }> = [
    {
      id: 'daily',
      label: 'Daily Drill',
      count: 10,
      timeMinutes: 10,
      icon: Zap,
      desc: '10 rapid-fire questions to maintain active daily study streaks and fresh recall.',
      badge: '10 Qs • 10 Mins',
    },
    {
      id: 'weekly',
      label: 'Weekly Assessment',
      count: 25,
      timeMinutes: 30,
      icon: Calendar,
      desc: '25 high-yield questions covering major syllabus units with Elo rating updates.',
      badge: '25 Qs • 30 Mins',
    },
    {
      id: 'monthly',
      label: 'Monthly Grand Mock',
      count: 50,
      timeMinutes: 60,
      icon: Award,
      desc: '50 comprehensive board-level questions for complete diagnostic SWOT benchmarking.',
      badge: '50 Qs • 60 Mins',
    },
    {
      id: 'custom',
      label: 'Custom Practice',
      count: config.questionCount || 15,
      timeMinutes: Math.round(config.timeLimitSec / 60) || 15,
      icon: Sliders,
      desc: 'Customize chapter topics, question counts, and difficulty thresholds.',
      badge: 'Tailored',
    },
  ];

  const handleSelectMode = (mode: QuizMode) => {
    if (mode === 'daily') {
      onChange({
        ...config,
        mode: 'daily',
        questionCount: 10,
        timeLimitSec: 10 * 60,
      });
    } else if (mode === 'weekly') {
      onChange({
        ...config,
        mode: 'weekly',
        questionCount: 25,
        timeLimitSec: 30 * 60,
      });
    } else if (mode === 'monthly') {
      onChange({
        ...config,
        mode: 'monthly',
        questionCount: 50,
        timeLimitSec: 60 * 60,
      });
    } else {
      onChange({
        ...config,
        mode: 'custom',
      });
    }
  };

  const toggleChapter = (chapter: string) => {
    const current = config.selectedChapters;
    const next = current.includes(chapter)
      ? current.filter((c) => c !== chapter)
      : [...current, chapter];
    onChange({ ...config, selectedChapters: next });
  };

  const toggleDifficulty = (d: Difficulty) => {
    const current = config.difficulties;
    const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
    onChange({ ...config, difficulties: next.length > 0 ? next : [d] });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = config.mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectMode(m.id)}
              className={`p-5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--color-surface)] border-[var(--color-accent)] shadow-md ring-2 ring-[var(--color-accent)]/20'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-lg ${
                      isSelected
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface-hover)] text-[var(--color-text)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isSelected
                        ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {m.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[var(--color-text)]">{m.label}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{m.desc}</p>
              </div>

              {isSelected && (
                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-semibold text-[var(--color-accent)]">
                  <span>Selected Mode</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Options Panel (visible when custom is selected) */}
      {config.mode === 'custom' && (
        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5 animate-in fade-in-50">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
            <Sliders className="w-4 h-4 text-[var(--color-accent)]" />
            <h4 className="font-bold text-sm text-[var(--color-text)]">Custom Quiz Parameters</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Question Count: {config.questionCount}
              </label>
              <input
                type="range"
                min={5}
                max={40}
                step={5}
                value={config.questionCount}
                onChange={(e) =>
                  onChange({
                    ...config,
                    questionCount: Number(e.target.value),
                    timeLimitSec: Number(e.target.value) * 60,
                  })
                }
                className="w-full accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mt-1 font-mono">
                <span>5 Qs</span>
                <span>20 Qs</span>
                <span>40 Qs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Time Limit: {Math.round(config.timeLimitSec / 60)} Minutes
              </label>
              <select
                value={Math.round(config.timeLimitSec / 60)}
                onChange={(e) =>
                  onChange({ ...config, timeLimitSec: Number(e.target.value) * 60 })
                }
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)]"
              >
                {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} Minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty Toggles */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
              Difficulty Levels
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                const active = config.difficulties.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                      active
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                        : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Focus Chapters ({config.selectedChapters.length > 0 ? config.selectedChapters.length : 'All'})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
              {availableChapters.map((ch) => {
                const selected = config.selectedChapters.includes(ch);
                return (
                  <label
                    key={ch}
                    className={`flex items-start gap-2 p-1.5 rounded text-xs cursor-pointer ${
                      selected ? 'font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleChapter(ch)}
                      className="mt-0.5 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <span className="line-clamp-1">{ch}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Launch CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
            <Clock className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Ready for {config.questionCount} Questions</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Attempts dynamically update your Elo mastery & FSRS review queue.
          </p>
        </div>

        <button
          onClick={onStart}
          disabled={totalQuestionsAvailable === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Quiz Now
        </button>
      </div>
    </div>
  );
}
