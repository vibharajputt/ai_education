// src/modules/sheet-generator/components/SheetControls.tsx
import React from 'react';
import type { SheetConfig } from '../types';
import type { Difficulty, QuestionType } from '@core';
import { Settings, RefreshCw, Printer, BookOpen, Filter, Sparkles } from 'lucide-react';
import type { CollegeTemplatePreset } from '../services/collegeQuestions';

interface SheetControlsProps {
  config: SheetConfig;
  availableChapters: string[];
  onChange: (updated: SheetConfig) => void;
  onGenerate: () => void;
  onPrint: () => void;
  totalMatching: number;
  isCollege?: boolean;
  presets?: CollegeTemplatePreset[];
  onApplyPreset?: (preset: CollegeTemplatePreset) => void;
}

export function SheetControls({
  config,
  availableChapters,
  onChange,
  onGenerate,
  onPrint,
  totalMatching,
  isCollege,
  presets,
  onApplyPreset,
}: SheetControlsProps) {
  const toggleChapter = (chapter: string) => {
    if (config.selectedChapters.includes(chapter)) {
      onChange({
        ...config,
        selectedChapters: config.selectedChapters.filter((c) => c !== chapter),
      });
    } else {
      onChange({
        ...config,
        selectedChapters: [...config.selectedChapters, chapter],
      });
    }
  };

  const selectAllChapters = () => {
    onChange({ ...config, selectedChapters: [...availableChapters] });
  };

  const clearChapters = () => {
    onChange({ ...config, selectedChapters: [] });
  };

  const toggleDifficulty = (diff: Difficulty) => {
    const current = config.difficulties;
    const next = current.includes(diff)
      ? current.filter((d) => d !== diff)
      : [...current, diff];
    onChange({ ...config, difficulties: next.length > 0 ? next : [diff] });
  };

  const toggleType = (type: QuestionType) => {
    const current = config.questionTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ ...config, questionTypes: next.length > 0 ? next : [type] });
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[var(--color-accent)]" />
          <h2 className="font-semibold text-base text-[var(--color-text)]">
            Worksheet Configuration
          </h2>
        </div>
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate Set
        </button>
      </div>

      {/* College Presets Quick Picker */}
      {isCollege && presets && presets.length > 0 && onApplyPreset && (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>1-Click College & Placement Test Templates:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Basic Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
            Worksheet / Exam Title
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder={isCollege ? 'e.g. National Campus Placement Assessment & Technical Drill' : 'e.g. CBSE Class 10 Science Practice Test'}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
            Institution / Header Subtitle
          </label>
          <input
            type="text"
            value={config.institutionName}
            onChange={(e) => onChange({ ...config, institutionName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder={isCollege ? 'e.g. Department of Computer Science & Engineering' : 'e.g. Department of Physics & Mathematics'}
          />
        </div>
      </div>

      {/* Question Count & Time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
            Question Count
          </label>
          <select
            value={config.questionCount}
            onChange={(e) => onChange({ ...config, questionCount: Number(e.target.value) })}
            className="w-full px-2.5 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] font-medium"
          >
            {[5, 10, 15, 20, 25, 30].map((num) => (
              <option key={num} value={num}>
                {num} Questions
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
            Time Allowed
          </label>
          <select
            value={config.timeLimitMinutes}
            onChange={(e) => onChange({ ...config, timeLimitMinutes: Number(e.target.value) })}
            className="w-full px-2.5 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] font-medium"
          >
            {[15, 30, 45, 60, 90, 120, 180].map((m) => (
              <option key={m} value={m}>
                {m} Minutes
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
            Answer Lines
          </label>
          <button
            type="button"
            onClick={() => onChange({ ...config, includeAnswerSpace: !config.includeAnswerSpace })}
            className={`w-full py-2 px-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
              config.includeAnswerSpace
                ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {config.includeAnswerSpace ? 'Included' : 'Hidden'}
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
            Solution Key
          </label>
          <button
            type="button"
            onClick={() => onChange({ ...config, includeAnswerKey: !config.includeAnswerKey })}
            className={`w-full py-2 px-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
              config.includeAnswerKey
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {config.includeAnswerKey ? 'Separate Page' : 'Omit'}
          </button>
        </div>
      </div>

      {/* Difficulty Mix */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
          Difficulty Mix
        </label>
        <div className="flex flex-wrap gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
            const active = config.difficulties.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                  active
                    ? d === 'easy'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : d === 'medium'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Types */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
          Question Types
        </label>
        <div className="flex flex-wrap gap-2">
          {(['mcq', 'short', 'long', 'fill-in', 'assertion-reason'] as QuestionType[]).map((t) => {
            const active = config.questionTypes.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border uppercase tracking-wider transition-colors ${
                  active
                    ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            Select Chapters ({config.selectedChapters.length}/{availableChapters.length})
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllChapters}
              className="text-xs text-[var(--color-accent)] hover:underline font-medium"
            >
              Select All
            </button>
            <span className="text-[var(--color-border)]">|</span>
            <button
              type="button"
              onClick={clearChapters}
              className="text-xs text-[var(--color-text-muted)] hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
          {availableChapters.map((chapter) => {
            const selected = config.selectedChapters.includes(chapter);
            return (
              <label
                key={chapter}
                className={`flex items-start gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                  selected
                    ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-text)] font-medium shadow-xs'
                    : 'border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleChapter(chapter)}
                  className="mt-0.5 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <span className="leading-tight line-clamp-2">{chapter}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>{totalMatching} candidate questions available in bank</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save A4 PDF
          </button>
        </div>
      </div>
    </div>
  );
}
