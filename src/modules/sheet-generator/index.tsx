// src/modules/sheet-generator/index.tsx
// Tier B Printable Worksheet & Practice Paper Generator Module.

import React, { useState, useMemo } from 'react';
import { useCollection } from '@core/loaders';
import { StateShell } from '@components/StateShell';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { FileText, Printer, CheckCircle2, PieChart, Sparkles, Filter } from 'lucide-react';
import { sheetGeneratorConfig } from './config';

export const SheetGeneratorModule: React.FC = () => {
  const { items, loading, error, reload } = useCollection(sheetGeneratorConfig.dataSource);

  // Configuration Form State
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficultyMix, setDifficultyMix] = useState<'balanced' | 'easy' | 'hard'>('balanced');
  const [worksheetTitle, setWorksheetTitle] = useState<string>('Class 10 Science & Maths Practice Worksheet');

  const [generatedItems, setGeneratedItems] = useState<typeof items | null>(null);

  // Get list of unique chapters from loaded items
  const availableChapters = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.chapter) set.add(item.chapter);
    });
    return Array.from(set).sort();
  }, [items]);

  // Read URL query parameters for 1-click PYQ Analyzer worksheet generation (Data Flow 2)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && availableChapters.length > 0) {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const targetChapter = params.get('chapter');
        if (targetChapter) {
          const matched = availableChapters.find(
            (c) => c.toLowerCase() === targetChapter.toLowerCase() || c.toLowerCase().includes(targetChapter.toLowerCase())
          );
          if (matched) {
            setSelectedChapters([matched]);
            setWorksheetTitle(`High-Frequency PYQ Worksheet: ${matched}`);
          }
        }
      }
    }
  }, [availableChapters]);

  // Handle Chapter Checkbox Toggle
  const toggleChapter = (chapter: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapter) ? prev.filter((c) => c !== chapter) : [...prev, chapter]
    );
  };

  const handleSelectAllChapters = () => {
    if (selectedChapters.length === availableChapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...availableChapters]);
    }
  };

  // Generate Set Algorithm
  const handleGenerateWorksheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    let pool = items;
    if (selectedChapters.length > 0) {
      pool = pool.filter((item) => item.chapter && selectedChapters.includes(item.chapter));
    }

    if (pool.length === 0) pool = items;

    // Filter or shuffle based on difficulty mix
    let filteredPool = [...pool];
    if (difficultyMix === 'easy') {
      filteredPool.sort((a, b) => (a.difficulty === 'easy' ? -1 : 1));
    } else if (difficultyMix === 'hard') {
      filteredPool.sort((a, b) => (a.difficulty === 'hard' ? -1 : 1));
    } else {
      filteredPool.sort(() => Math.random() - 0.5);
    }

    const selected = filteredPool.slice(0, Math.min(questionCount, filteredPool.length));
    setGeneratedItems(selected);
  };

  // Coverage Report Calculations
  const coverageStats = useMemo(() => {
    if (!generatedItems || generatedItems.length === 0) return null;

    const coveredChaptersSet = new Set<string>();
    const chapterCounts = new Map<string, number>();

    generatedItems.forEach((item) => {
      if (item.chapter) {
        coveredChaptersSet.add(item.chapter);
        chapterCounts.set(item.chapter, (chapterCounts.get(item.chapter) || 0) + 1);
      }
    });

    const targetTotalChapters = selectedChapters.length > 0 ? selectedChapters.length : availableChapters.length;
    const coveredCount = coveredChaptersSet.size;
    const pct = Math.round((coveredCount / targetTotalChapters) * 100);

    return {
      coveredCount,
      targetTotalChapters,
      pct,
      chapterCounts: Array.from(chapterCounts.entries()),
    };
  }, [generatedItems, selectedChapters, availableChapters]);

  if (loading || error || items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <StateShell
          status={loading ? 'loading' : error ? 'error' : 'empty'}
          error={error}
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Scope Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--color-accent)]" />
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
              {sheetGeneratorConfig.title}
            </h1>
            <Badge label="Tier B • Worksheet Generator" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" />
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            {sheetGeneratorConfig.description}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          <span>Scope: {sheetGeneratorConfig.scopeLabel}</span>
        </div>
      </div>

      {/* Generator Control Panel */}
      <Card className="p-6 space-y-5 print:hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-accent)]" />
            <h2 className="text-sm font-bold text-[var(--color-text)]">Worksheet Parameters & Pool Selector</h2>
          </div>
          <button
            type="button"
            onClick={handleSelectAllChapters}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            {selectedChapters.length === availableChapters.length ? 'Deselect All' : 'Select All Chapters'}
          </button>
        </div>

        <form onSubmit={handleGenerateWorksheet} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[var(--color-text)]">Worksheet Title</label>
            <input
              type="text"
              value={worksheetTitle}
              onChange={(e) => setWorksheetTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-semibold"
            />
          </div>

          {/* Chapter Mix Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--color-text)]">
              Select Chapters ({selectedChapters.length > 0 ? selectedChapters.length : availableChapters.length} Selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              {availableChapters.map((ch) => {
                const isChecked = selectedChapters.includes(ch);
                return (
                  <label
                    key={ch}
                    className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                      isChecked
                        ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-text)] font-bold'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChapter(ch)}
                      className="rounded text-[var(--color-accent)]"
                    />
                    <span className="truncate">{ch}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Count & Difficulty Mix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--color-text)]">Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-semibold"
              >
                <option value={5}>5 Questions (Quick Quiz)</option>
                <option value={10}>10 Questions (Standard Worksheet)</option>
                <option value={15}>15 Questions (Unit Assessment)</option>
                <option value={20}>20 Questions (Full Chapter Test)</option>
                <option value={25}>25 Questions (Comprehensive Mock)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--color-text)]">Difficulty Profile Mix</label>
              <select
                value={difficultyMix}
                onChange={(e) => setDifficultyMix(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-semibold"
              >
                <option value="balanced">Balanced Mix (Easy + Medium + Hard)</option>
                <option value="easy">Easy Foundations Focus</option>
                <option value="hard">Hard Exam Challenge Focus</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" /> Generate Printable Worksheet
            </button>
          </div>
        </form>
      </Card>

      {/* Generated Worksheet View & Coverage Report */}
      {generatedItems && (
        <div className="space-y-6">
          {/* Coverage Report Card */}
          {coverageStats && (
            <Card className="p-5 space-y-3 print:hidden border-l-4 border-l-emerald-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text)]">Chapter Coverage Report</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Covers {coverageStats.coveredCount} of {coverageStats.targetTotalChapters} selected chapters ({coverageStats.pct}% coverage)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print / Export PDF
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {coverageStats.chapterCounts.map(([ch, cnt]) => (
                  <span
                    key={ch}
                    className="px-2.5 py-1 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{ch}: {cnt} q</span>
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Printable Worksheet A4 Container */}
          <div className="p-8 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md space-y-8 print:p-0 print:border-none print:shadow-none print:bg-transparent">
            {/* Worksheet Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tight">{worksheetTitle}</h1>
              <div className="flex justify-between items-center text-xs font-semibold pt-2 text-slate-700">
                <span>Time Allowed: {generatedItems.length * 3} Minutes</span>
                <span>Total Questions: {generatedItems.length}</span>
                <span>Maximum Marks: {generatedItems.length * 4}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 text-slate-600 border-t border-slate-200">
                <span>Student Name: ___________________________</span>
                <span>Date: _______________</span>
                <span>Roll No: ________</span>
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
              {generatedItems.map((item, index) => (
                <div key={item.id} className="space-y-2 pb-4 border-b border-slate-200 last:border-none">
                  <div className="flex items-start justify-between font-bold text-sm">
                    <span>Q{index + 1}. {item.chapter ? `[${item.chapter}]` : ''}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      [{(item as any).marks || 4} Marks]
                    </span>
                  </div>

                  <div className="text-sm leading-relaxed text-slate-800 font-sans">
                    <MarkdownRenderer content={item.body} />
                  </div>

                  {item.latex && (
                    <div className="p-2 rounded bg-slate-50 font-mono text-xs text-slate-700">
                      ${item.latex}$
                    </div>
                  )}

                  {/* Lines for student answers */}
                  <div className="space-y-2 pt-2">
                    <div className="border-b border-dashed border-slate-300 h-4" />
                    <div className="border-b border-dashed border-slate-300 h-4" />
                  </div>
                </div>
              ))}
            </div>

            {/* ANSWER KEY ON SEPARATE PAGE (Strict Requirement) */}
            <div className="break-before-page pt-10 border-t-4 border-slate-900 space-y-6 print:break-before-page">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  ANSWER KEY & OFFICIAL SOLUTION GUIDE
                </h2>
                <p className="text-xs text-slate-600">
                  {worksheetTitle} — Confidential Teacher / Evaluation Reference
                </p>
              </div>

              <div className="space-y-4">
                {generatedItems.map((item, index) => {
                  const solutionText =
                    (item.metadata?.solution as string) ||
                    (item.metadata?.explanation as string) ||
                    'Refer to governing principles and formulas for step-by-step resolution.';

                  return (
                    <div key={item.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="font-bold text-slate-900 flex justify-between">
                        <span>Q{index + 1} Solution & Marking Scheme</span>
                        <span className="text-slate-600">Chapter: {item.chapter || 'STEM'}</span>
                      </div>

                      <div className="text-slate-800 leading-relaxed pt-1">
                        <MarkdownRenderer content={solutionText} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
