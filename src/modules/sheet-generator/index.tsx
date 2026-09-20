// src/modules/sheet-generator/index.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useCollection } from '@core';
import { StateShell } from '@components/StateShell';
import { SheetControls } from './components/SheetControls';
import { CoverageReport } from './components/CoverageReport';
import { WorksheetPrintView } from './components/WorksheetPrintView';
import type { SheetConfig, WorksheetData, CoverageReportData } from './types';
import type { Difficulty, QuestionType, ContentItem } from '@core';
import { FileText, Sliders, Eye } from 'lucide-react';

export function SheetGeneratorModule() {
  const { collection, items: rawItems, loading, error, reload } = useCollection('pyq/class10.json');

  // Available unique chapters from pool
  const allChapters = useMemo(() => {
    const set = new Set<string>();
    for (const item of rawItems) {
      if (item.chapter) set.add(item.chapter);
    }
    return Array.from(set).sort();
  }, [rawItems]);

  // Worksheet configuration state
  const [config, setConfig] = useState<SheetConfig>(() => ({
    title: 'CBSE Board Examination Practice Sheet',
    institutionName: 'Apex Science & Mathematics Academy',
    studentNameRequired: true,
    timeLimitMinutes: 45,
    totalMarks: 25,
    selectedChapters: [],
    difficulties: ['easy', 'medium', 'hard'] as Difficulty[],
    questionTypes: ['mcq', 'short', 'long', 'fill-in', 'assertion-reason'] as QuestionType[],
    questionCount: 10,
    includeAnswerSpace: true,
    includeAnswerKey: true,
  }));

  // Auto-initialize chapters once loaded
  const [hasInitializedChapters, setHasInitializedChapters] = useState(false);
  if (!hasInitializedChapters && allChapters.length > 0) {
    setConfig((prev) => ({
      ...prev,
      selectedChapters: allChapters.slice(0, 5),
    }));
    setHasInitializedChapters(true);
  }

  // Active view tab on mobile/desktop: 'controls' | 'preview'
  const [activeTab, setActiveTab] = useState<'controls' | 'preview'>('controls');
  const [seed, setSeed] = useState(1);

  // Filter pool based on selected options
  const matchingPool = useMemo(() => {
    return rawItems.filter((item) => {
      if (item.kind !== 'question') return false;
      if (config.selectedChapters.length > 0 && item.chapter && !config.selectedChapters.includes(item.chapter)) {
        return false;
      }
      if (item.difficulty && !config.difficulties.includes(item.difficulty)) {
        return false;
      }
      const qType = (item as any).questionType;
      if (qType && !config.questionTypes.includes(qType)) {
        return false;
      }
      return true;
    });
  }, [rawItems, config.selectedChapters, config.difficulties, config.questionTypes]);

  // Deterministically select questions for worksheet
  const worksheetData = useMemo<WorksheetData>(() => {
    if (matchingPool.length === 0) {
      return {
        config,
        items: [],
        coverage: {
          totalPoolCount: rawItems.length,
          selectedCount: 0,
          coveredChapters: [],
          allChapters,
          coveragePercent: 0,
          difficultyCounts: { easy: 0, medium: 0, hard: 0 },
          typeCounts: {},
          totalMarks: 0,
        },
        generatedAt: Date.now(),
      };
    }

    // Pseudo-random deterministic shuffle with seed
    const shuffled = [...matchingPool].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * 31 + seed) % 100;
      const hashB = (b.id.charCodeAt(0) * 31 + seed) % 100;
      return hashA - hashB;
    });

    const selectedItems = shuffled.slice(0, config.questionCount);

    // Compute coverage stats
    const coveredChaptersSet = new Set<string>();
    const diffCounts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
    const typeCounts: Record<string, number> = {};
    let totalMarks = 0;

    for (const it of selectedItems) {
      if (it.chapter) coveredChaptersSet.add(it.chapter);
      if (it.difficulty) diffCounts[it.difficulty] = (diffCounts[it.difficulty] || 0) + 1;
      const t = (it as any).questionType || 'general';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      const marks = (it as any).marks || (it.difficulty === 'hard' ? 5 : it.difficulty === 'medium' ? 3 : 1);
      totalMarks += marks;
    }

    const coveredChapters = Array.from(coveredChaptersSet);
    const coveragePercent = allChapters.length > 0
      ? Math.round((coveredChapters.length / allChapters.length) * 100)
      : 100;

    const coverage: CoverageReportData = {
      totalPoolCount: rawItems.length,
      selectedCount: selectedItems.length,
      coveredChapters,
      allChapters,
      coveragePercent,
      difficultyCounts: diffCounts,
      typeCounts,
      totalMarks,
    };

    return {
      config,
      items: selectedItems,
      coverage,
      generatedAt: Date.now(),
    };
  }, [matchingPool, config, rawItems.length, allChapters, seed]);

  const handleRegenerate = useCallback(() => {
    setSeed((prev) => prev + 1);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return <StateShell state="loading" title="Loading Question Pool..." message="Indexing questions for worksheet compilation." />;
  }

  if (error) {
    return (
      <StateShell
        state="error"
        title="Failed to Load Question Pool"
        message={error.message}
        onRetry={reload}
      />
    );
  }

  if (rawItems.length === 0) {
    return (
      <StateShell
        state="empty"
        title="No Questions Available"
        message="The question database is currently empty."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4 print:hidden">
        <div>
          <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
            {collection?.scopeLabel || 'Printable Practice Worksheet Engine'}
          </span>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
            Practice Worksheet Generator
          </h1>
        </div>

        {/* View Toggle on Mobile/Tablet */}
        <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'controls'
                ? 'bg-[var(--color-accent)] text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Config & Scope
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'preview'
                ? 'bg-[var(--color-accent)] text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live A4 Preview
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls & Coverage Report */}
        <div className={`lg:col-span-5 space-y-6 print:hidden ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <CoverageReport coverage={worksheetData.coverage} timeLimitMinutes={config.timeLimitMinutes} />
          <SheetControls
            config={config}
            availableChapters={allChapters}
            onChange={setConfig}
            onGenerate={handleRegenerate}
            onPrint={handlePrint}
            totalMatching={matchingPool.length}
          />
        </div>

        {/* Right Column: Live Printable Sheet Preview */}
        <div className={`lg:col-span-7 space-y-4 ${activeTab === 'controls' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium print:hidden">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[var(--color-accent)]" />
              Print Preview (A4 Scaled Document)
            </span>
            <span>{worksheetData.items.length} questions compiled</span>
          </div>

          <WorksheetPrintView worksheet={worksheetData} />
        </div>
      </div>
    </div>
  );
}
