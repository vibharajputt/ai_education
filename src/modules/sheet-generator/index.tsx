// src/modules/sheet-generator/index.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useCollection } from '@core';
import { StateShell } from '@components/StateShell';
import { SheetControls } from './components/SheetControls';
import { CoverageReport } from './components/CoverageReport';
import { WorksheetPrintView } from './components/WorksheetPrintView';
import type { SheetConfig, WorksheetData, CoverageReportData } from './types';
import type { Difficulty, QuestionType, ContentItem } from '@core';
import {
  FileText,
  Eye,
  Sparkles,
  GraduationCap,
  Printer,
  RefreshCw,
  EyeOff,
  CheckCircle2,
  Building,
  Cpu,
  Brain,
  Award,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  COLLEGE_QUESTION_POOL,
  COLLEGE_PRESETS,
  CollegeTemplatePreset,
} from './services/collegeQuestions';

export function SheetGeneratorModule() {
  const { track } = useParams<{ track?: string }>();
  const location = useLocation();
  const isCollege = track === 'college' || location.pathname.includes('/college');

  // Load school collection if on school track; otherwise use college pool
  const { collection, items: schoolRawItems, loading, error, reload } = useCollection(
    isCollege ? 'demo-college.json' : 'pyq/class10.json'
  );

  const rawItems: ContentItem[] = useMemo(() => {
    if (isCollege) {
      const combined = [...COLLEGE_QUESTION_POOL];
      if (schoolRawItems && schoolRawItems.length > 0) {
        for (const it of schoolRawItems) {
          if (!combined.some((c) => c.id === it.id)) {
            combined.push(it);
          }
        }
      }
      return combined;
    }
    return schoolRawItems;
  }, [isCollege, schoolRawItems]);

  // Available unique chapters from pool
  const allChapters = useMemo(() => {
    const set = new Set<string>();
    for (const item of rawItems) {
      if (item.chapter) set.add(item.chapter);
    }
    return Array.from(set).sort();
  }, [rawItems]);

  const [activePresetId, setActivePresetId] = useState<string>('campus-placement');
  const [showAllSolutions, setShowAllSolutions] = useState<boolean>(false);
  const [viewStep, setViewStep] = useState<'configure' | 'sheet'>('configure');

  // Worksheet configuration state
  const [config, setConfig] = useState<SheetConfig>(() => ({
    title: isCollege
      ? 'National Campus Placement Assessment & Technical Drill'
      : 'CBSE Board Examination Practice Sheet',
    institutionName: isCollege
      ? 'Department of Computer Science & Placement Cell'
      : 'Apex Science & Mathematics Academy',
    studentNameRequired: true,
    timeLimitMinutes: isCollege ? 60 : 45,
    totalMarks: isCollege ? 50 : 25,
    selectedChapters: [],
    difficulties: ['easy', 'medium', 'hard'] as Difficulty[],
    questionTypes: ['mcq', 'short', 'long', 'fill-in', 'assertion-reason'] as QuestionType[],
    questionCount: isCollege ? 10 : 10,
    includeAnswerSpace: true,
    includeAnswerKey: true,
  }));

  // Auto-initialize chapters once loaded
  const [hasInitializedChapters, setHasInitializedChapters] = useState(false);
  if (!hasInitializedChapters && allChapters.length > 0) {
    setConfig((prev) => ({
      ...prev,
      selectedChapters: allChapters.slice(0, 6),
    }));
    setHasInitializedChapters(true);
  }

  const [seed, setSeed] = useState(1);

  // Apply college template preset
  const handleApplyPreset = useCallback((preset: CollegeTemplatePreset) => {
    setActivePresetId(preset.id);
    setConfig((prev) => ({
      ...prev,
      title: preset.defaultTitle,
      institutionName: preset.defaultInstitution,
      timeLimitMinutes: preset.defaultTimeMinutes,
      totalMarks: preset.defaultMarks,
      questionCount: preset.defaultCount,
      selectedChapters: preset.chapters.filter((ch) => allChapters.includes(ch)),
      difficulties: preset.difficulties,
      questionTypes: preset.questionTypes,
    }));
    setSeed((s) => s + 1);
  }, [allChapters]);

  // Filter pool based on selected options
  const matchingPool = useMemo(() => {
    return rawItems.filter((item) => {
      if (item.kind !== 'question' && item.kind !== 'interview-q') return false;
      if (config.selectedChapters.length > 0 && item.chapter && !config.selectedChapters.includes(item.chapter)) {
        return false;
      }
      if (item.difficulty && !config.difficulties.includes(item.difficulty)) {
        return false;
      }
      const qType = (item as any).questionType || ((item as any).metadata?.questionType);
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
    let calculatedTotalMarks = 0;

    for (const it of selectedItems) {
      if (it.chapter) coveredChaptersSet.add(it.chapter);
      if (it.difficulty) diffCounts[it.difficulty] = (diffCounts[it.difficulty] || 0) + 1;
      const t = (it as any).questionType || (it as any).metadata?.questionType || 'general';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      const marks = (it as any).marks || (it as any).metadata?.marks || (it.difficulty === 'hard' ? 5 : it.difficulty === 'medium' ? 3 : 2);
      calculatedTotalMarks += marks;
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
      totalMarks: calculatedTotalMarks,
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

  const handleContinueToSheet = useCallback(() => {
    setViewStep('sheet');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'campus-placement':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'semester-exam':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case 'gate-drill':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'ai-ml-specialist':
        return <Brain className="w-4 h-4 text-pink-500" />;
      case 'core-ece-embedded':
        return <Cpu className="w-4 h-4 text-teal-500" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-500" />;
    }
  };

  if (loading && !isCollege) {
    return <StateShell state="loading" title="Loading Question Pool..." message="Indexing questions for worksheet compilation." />;
  }

  if (error && !isCollege) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* STEP 1: CONFIGURATION & SELECTION VIEW                                     */}
      {/* ========================================================================= */}
      {viewStep === 'configure' ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                  {isCollege ? (
                    <>
                      <GraduationCap className="w-3.5 h-3.5" />
                      Engineering & Campus Assessment Studio
                    </>
                  ) : (
                    'CBSE Board Practice Engine'
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {isCollege ? 'College Technical & Placement Test Generator' : 'Practice Worksheet Generator'}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  {isCollege
                    ? 'Configure your campus placement test (TCS NQT / Infosys / Amazon), university semester papers, or GATE mock drills. Choose syllabus chapters, question counts, and difficulty balance.'
                    : 'Select syllabus chapters, difficulty mix, and question types to generate customized practice papers with detached solution keys.'}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleContinueToSheet}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Generate Question Paper</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 1-Click College Presets */}
          {isCollege && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Select Test Format & Question Paper Template:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {COLLEGE_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                            {getPresetIcon(preset.id)}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                          {preset.name}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {preset.subtitle}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{preset.defaultCount} Qs</span>
                        <span>{preset.defaultTimeMinutes}m</span>
                        <span>{preset.defaultMarks} Marks</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Configuration Form & Coverage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <SheetControls
                config={config}
                availableChapters={allChapters}
                onChange={setConfig}
                onGenerate={handleRegenerate}
                onPrint={handlePrint}
                onContinue={handleContinueToSheet}
                totalMatching={matchingPool.length}
                isCollege={isCollege}
                presets={COLLEGE_PRESETS}
                onApplyPreset={handleApplyPreset}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <CoverageReport coverage={worksheetData.coverage} timeLimitMinutes={config.timeLimitMinutes} />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* STEP 2: FULL-WIDTH ASSESSMENT SHEET VIEW                                   */
        /* ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Sticky/Floating Action Bar */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewStep('configure');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-500" />
                <span>Edit Configuration</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium">
                <span className="h-4 w-px bg-[var(--color-border)]" />
                <span className="font-semibold text-[var(--color-text)]">{config.title}</span>
                <span>•</span>
                <span>{worksheetData.items.length} Questions</span>
                <span>•</span>
                <span>{config.timeLimitMinutes} Mins</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowAllSolutions(!showAllSolutions)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)] text-xs font-semibold transition-all cursor-pointer"
              >
                {showAllSolutions ? <EyeOff className="w-3.5 h-3.5 text-indigo-500" /> : <Eye className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{showAllSolutions ? 'Hide Solutions' : 'Show Solutions'}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--color-text)] text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                <span>Shuffle Questions</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print A4 / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Full-width Question Paper Sheet */}
          <div className="max-w-4xl mx-auto">
            <WorksheetPrintView
              worksheet={worksheetData}
              showSolutionsGlobal={showAllSolutions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
