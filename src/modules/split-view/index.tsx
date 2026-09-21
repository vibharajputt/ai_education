// src/modules/split-view/index.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@core/auth';
import {
  CBSE_PAPERS_DATABASE,
  type CBSESamplePaper,
  type CBSEQuestion,
} from './data/cbsePapers';
import { UploadPaperModal } from './components/UploadPaperModal';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import {
  Columns,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Award,
  Clock,
  ChevronRight,
  ChevronLeft,
  Layers,
  HelpCircle,
  Maximize2,
  Minimize2,
  BookOpen,
  Filter,
  School,
  X,
  Send,
  Bot,
  Upload,
  FileUp,
  Flame,
  Check,
  Info,
} from 'lucide-react';

export function SplitViewModule() {
  const { user } = useAuth();

  // Determine user's active class level: default to user's class if '10' or '12', else '10'
  const defaultClass: '10' | '12' =
    user?.track === 'school' && user?.classLevel === '12' ? '12' : '10';

  const [selectedClass, setSelectedClass] = useState<'10' | '12'>(defaultClass);

  // Sync with user's classLevel if it changes in auth state
  useEffect(() => {
    if (user?.track === 'school') {
      if (user.classLevel === '12') setSelectedClass('12');
      else if (user.classLevel === '10') setSelectedClass('10');
    }
  }, [user?.classLevel, user?.track]);

  // Dynamic list of papers including user uploaded ones
  const [customPapers, setCustomPapers] = useState<CBSESamplePaper[]>([]);

  // Filter available papers for the selected class
  const classPapers = useMemo(() => {
    const combined = [...customPapers, ...CBSE_PAPERS_DATABASE];
    return combined.filter((p) => p.classLevel === selectedClass);
  }, [selectedClass, customPapers]);

  // Selected paper (defaults to first available paper for selected class)
  const [selectedPaperId, setSelectedPaperId] = useState<string>(() => {
    return classPapers[0]?.id || 'cbse-10-science-2025';
  });

  // When class changes, update selected paper if current paper is not in that class
  useEffect(() => {
    if (!classPapers.some((p) => p.id === selectedPaperId)) {
      if (classPapers[0]) {
        setSelectedPaperId(classPapers[0].id);
      }
    }
  }, [classPapers, selectedPaperId]);

  const activePaper: CBSESamplePaper = useMemo(() => {
    return (
      classPapers.find((p) => p.id === selectedPaperId) ||
      classPapers[0] ||
      CBSE_PAPERS_DATABASE[0]
    );
  }, [classPapers, selectedPaperId]);

  // Active question for solution viewing
  const [activeQuestionId, setActiveQuestionId] = useState<string>('');

  // Auto-select first question of active paper
  useEffect(() => {
    if (activePaper.questions.length > 0) {
      setActiveQuestionId(activePaper.questions[0].id);
    }
  }, [activePaper]);

  // UI state
  const [isSplitOpen, setIsSplitOpen] = useState<boolean>(false);
  const [isMaximizedSolution, setIsMaximizedSolution] = useState<boolean>(false);
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // AI Doubt Chat State for active question
  const [doubtMessages, setDoubtMessages] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([]);
  const [doubtInput, setDoubtInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Filtered questions in active paper
  const filteredQuestions = useMemo(() => {
    return activePaper.questions.filter((q) => {
      if (sectionFilter === 'all') return true;
      return q.section === sectionFilter;
    });
  }, [activePaper, sectionFilter]);

  const activeQuestion = useMemo(() => {
    return (
      activePaper.questions.find((q) => q.id === activeQuestionId) ||
      activePaper.questions[0] ||
      null
    );
  }, [activePaper, activeQuestionId]);

  const activeIndex = activePaper.questions.findIndex(
    (q) => q.id === activeQuestionId
  );

  const handleOpenSolution = (questionId: string) => {
    setActiveQuestionId(questionId);
    setIsSplitOpen(true);
    setDoubtMessages([]);
    // Smoothly scroll active question into view on left pane
    setTimeout(() => {
      document.getElementById(`q-${questionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  const handleNextQuestion = () => {
    if (activeIndex < activePaper.questions.length - 1) {
      const nextId = activePaper.questions[activeIndex + 1].id;
      setActiveQuestionId(nextId);
      setDoubtMessages([]);
      document.getElementById(`q-${nextId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handlePrevQuestion = () => {
    if (activeIndex > 0) {
      const prevId = activePaper.questions[activeIndex - 1].id;
      setActiveQuestionId(prevId);
      setDoubtMessages([]);
      document.getElementById(`q-${prevId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handlePaperUploaded = (newPaper: CBSESamplePaper) => {
    setCustomPapers((prev) => [newPaper, ...prev]);
    setSelectedClass(newPaper.classLevel);
    setSelectedPaperId(newPaper.id);
    setIsSplitOpen(true);
  };

  const handleSendDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;

    const userText = doubtInput.trim();
    setDoubtMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setDoubtInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = `According to CBSE Marking Scheme for **${activeQuestion?.chapter}**: Keep in mind that evaluators award step-marks for stating the initial formula and correct SI units. ${
        activeQuestion?.examinerPitfall ||
        'Avoid skipping intermediate algebraic steps.'
      }`;
      if (userText.toLowerCase().includes('why') || userText.toLowerCase().includes('how')) {
        aiResponse = `Great doubt! In this question (${activeQuestion?.competency}), CBSE tests your conceptual mastery. ${activeQuestion?.aiExplanation}`;
      }
      setDoubtMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsAiTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[700px] bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* ── TOP NAV: Class Filter, Subject Tabs, Upload & Official Source ── */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Class Switcher */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[var(--color-text)]">
                  CBSE Sample Papers & Split-Screen Solutions
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Class {selectedClass}th
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Authentic Subject-Wise Question Papers with AI Step-by-Step Marking Solutions
              </p>
            </div>
          </div>

          {/* Controls: Class 10/12 Switcher, Upload Button & Official CBSE Link */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class 10 / 12 Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setSelectedClass('10')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedClass === '10'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Class 10th</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedClass('12')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedClass === '12'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Class 12th</span>
              </button>
            </div>

            {/* 📤 Upload Paper Button */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Paper (PDF/Image)</span>
            </button>

            {/* Official cbseacademic.nic.in Link */}
            <a
              href={activePaper.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CBSE Portal (cbseacademic.nic.in)</span>
              <span className="sm:hidden">CBSE Link</span>
            </a>
          </div>
        </div>

        {/* ── SUBJECT SELECTION TABS & PAPER META ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--color-border)]">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mr-1 shrink-0">
              Select Subject:
            </span>
            {classPapers.map((paper) => {
              const isSelected = paper.id === activePaper.id;
              const isCustom = paper.id.startsWith('user-uploaded');
              return (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => setSelectedPaperId(paper.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? selectedClass === '10'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500 shadow-xs ring-1 ring-purple-500/30'
                      : 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] border-[var(--color-border)]'
                  }`}
                >
                  {isCustom && <FileUp className="w-3 h-3 text-amber-500" />}
                  <span>{paper.subject}</span>
                  <span className="text-[10px] font-normal opacity-75">
                    ({paper.subjectCode})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Paper Stats */}
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-semibold shrink-0">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              {activePaper.timeAllowed}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {activePaper.totalMarks} Marks
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[11px]">
              {activePaper.questions.length} Questions
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA (QUESTION PAPER & SPLIT-SCREEN SOLUTION) ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ── LEFT PANE: Question Paper ── */}
        <div
          className={`flex flex-col h-full border-r border-[var(--color-border)] bg-[var(--color-bg)] transition-all duration-300 ${
            isSplitOpen
              ? isMaximizedSolution
                ? 'hidden'
                : 'w-full lg:w-1/2'
              : 'w-full max-w-5xl mx-auto'
          }`}
        >
          {/* Section Filter Bar */}
          <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)] mr-0.5 shrink-0" />
              {[
                { id: 'all', label: 'All Questions' },
                { id: 'Section A', label: 'Section A (MCQs • 1M)' },
                { id: 'Section B', label: 'Section B (VSA • 2M)' },
                { id: 'Section C', label: 'Section C (SA • 3M)' },
                { id: 'Section D', label: 'Section D (LA • 5M)' },
                { id: 'Section E', label: 'Section E (Case Study • 4M)' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSectionFilter(sec.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                    sectionFilter === sec.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-[var(--color-text-muted)] font-semibold shrink-0">
              {filteredQuestions.length} Questions
            </span>
          </div>

          {/* Question List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredQuestions.map((q) => {
              const isActive = q.id === activeQuestionId && isSplitOpen;
              return (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-[var(--color-surface)] border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {/* Question Header Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)]'
                        }`}
                      >
                        Q{q.questionNumber}
                      </span>
                      <span className="text-xs font-bold text-[var(--color-text)]">
                        {q.chapter}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase hidden sm:inline">
                        {q.section}
                      </span>
                    </div>
                  </div>

                  {/* Question Text & Math */}
                  <div className="space-y-3">
                    <div className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed prose dark:prose-invert max-w-none">
                      <MarkdownRenderer content={q.questionText} />
                    </div>

                    {/* MCQ Options with KaTeX rendering */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium flex items-start gap-2"
                          >
                            <span className="font-bold text-blue-600 shrink-0">
                              {String.fromCharCode(97 + i)}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <MarkdownRenderer content={opt.replace(/^\([a-d]\)\s*/, '')} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── ACTION FOOTER: "EXPLAIN / STEP-BY-STEP SOLUTION" BUTTON ── */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[var(--color-text-muted)] font-medium truncate">
                      📌 Competency: <strong className="text-[var(--color-text)]">{q.competency}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenSolution(q.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-blue-500/20'
                          : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Viewing Solution' : '💡 Explain & Step Solution'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANE: HALF-SCREEN STEP-BY-STEP SOLUTION VIEW ── */}
        {isSplitOpen && activeQuestion ? (
          <div
            className={`h-full flex flex-col bg-[var(--color-bg)] overflow-hidden animate-in fade-in duration-200 ${
              isMaximizedSolution ? 'w-full' : 'w-full lg:w-1/2'
            }`}
          >
            {/* Split View Header with Controls */}
            <div className="p-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                  Q{activeQuestion.questionNumber}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    CBSE Verified Marking Scheme & Solution
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {activeQuestion.chapter} • {activeQuestion.marks} Marks
                  </p>
                </div>
              </div>

              {/* Navigation, Maximize & Close */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={activeIndex <= 0}
                  className="p-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] disabled:opacity-40 cursor-pointer"
                  title="Previous Question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[var(--color-text)] px-1">
                  {activeIndex + 1}/{activePaper.questions.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={activeIndex >= activePaper.questions.length - 1}
                  className="p-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] disabled:opacity-40 cursor-pointer"
                  title="Next Question"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Maximize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMaximizedSolution(!isMaximizedSolution)}
                  className="p-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors ml-1 hidden lg:block cursor-pointer"
                  title={isMaximizedSolution ? 'Restore Split View' : 'Maximize Solution'}
                >
                  {isMaximizedSolution ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSplitOpen(false);
                    setIsMaximizedSolution(false);
                  }}
                  className="p-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-red-500/10 hover:text-red-500 border border-[var(--color-border)] transition-colors ml-1 cursor-pointer"
                  title="Close Half-Screen View"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Solution Scroll Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* 1. Official CBSE Model Answer (Green Card) */}
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-emerald-500/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Official CBSE Model Answer</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                    Source: {activeQuestion.cbseSourceRef}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={activeQuestion.modelAnswer} />
                </div>
              </div>

              {/* 2. Step-by-Step Mark Allocation Breakdown (Blue Steps) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-500" />
                    Step-Wise Mark Distribution
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    Total: {activeQuestion.marks} Marks
                  </span>
                </div>

                <div className="space-y-2">
                  {activeQuestion.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[var(--color-text)]">
                          {st.label}
                        </h4>
                        {st.allocatedMarks && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            +{st.allocatedMarks}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        <MarkdownRenderer content={st.body} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Examiner Pitfall & Common Student Errors (Amber Card) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>CBSE Evaluator Warning / Common Mistakes to Avoid</span>
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-200/90 leading-relaxed">
                  {activeQuestion.examinerPitfall}
                </p>
              </div>

              {/* 4. AI Conceptual Explanation & Deep Dive (Purple Card) */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>AI Simplified Conceptual Takeaway</span>
                </div>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">
                  {activeQuestion.aiExplanation}
                </p>
              </div>

              {/* 5. Interactive "Ask AI Tutor" Instant Doubt Clarifier */}
              <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-blue-500" />
                    Ask AI Tutor on Q{activeQuestion.questionNumber}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Instant clarification
                  </span>
                </div>

                {doubtMessages.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                    {doubtMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 text-xs ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white font-medium'
                              : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
                          }`}
                        >
                          <MarkdownRenderer content={msg.text} />
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin text-blue-500" />
                        <span>AI Tutor is analyzing step marking...</span>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSendDoubt} className="flex gap-2">
                  <input
                    type="text"
                    value={doubtInput}
                    onChange={(e) => setDoubtInput(e.target.value)}
                    placeholder="Have a doubt in this step? Ask here..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!doubtInput.trim() || isAiTyping}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── UPLOAD PAPER MODAL ── */}
      <UploadPaperModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPaperUploaded={handlePaperUploaded}
        currentClass={selectedClass}
      />
    </div>
  );
}
