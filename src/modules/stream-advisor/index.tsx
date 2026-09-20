import React, { useState, useEffect } from 'react';
import { useCollection } from '@core/loaders';
import {
  calculateStreamRecommendation,
  type OptionAnswer,
  type StreamAdvisorResult,
  type StreamId,
  STREAMS_CATALOG,
} from './rubric';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Info,
  Award,
  ArrowRight,
  History,
  TrendingUp,
  FileText,
} from 'lucide-react';

const HISTORY_KEY = 'ai_edu_stream_advisor_history_v1';

export function StreamAdvisorModule() {
  const { items, loading, error, reload } = useCollection('stream-advisor.json');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<StreamAdvisorResult | null>(null);
  const [previousResult, setPreviousResult] = useState<StreamAdvisorResult | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Load previous assessment from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setPreviousResult(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load previous stream assessment:', err);
    }
  }, []);

  if (loading) {
    return <StateShell status="loading" />;
  }

  if (error) {
    return <StateShell status="error" error={error} onRetry={reload} />;
  }

  if (items.length === 0) {
    return <StateShell status="empty" emptyTitle="No stream advisor questions found." />;
  }

  const currentQuestion = items[currentIndex];
  const options: any[] = (currentQuestion?.metadata as any)?.options || [];
  const currentAnswerId = selectedAnswers[currentQuestion?.id];

  const handleSelectOption = (optId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final result
      const formattedAnswers: OptionAnswer[] = items.map((q, idx) => {
        const qOptions: any[] = (q.metadata as any)?.options || [];
        const chosenOptId = selectedAnswers[q.id];
        const chosenOpt = qOptions.find((o) => o.id === chosenOptId) || qOptions[0];

        return {
          questionId: q.id,
          questionIndex: idx + 1,
          questionText: q.body,
          selectedOptionId: chosenOpt.id,
          selectedOptionText: chosenOpt.text,
          weights: chosenOpt.weights,
        };
      });

      const res = calculateStreamRecommendation(formattedAnswers);
      setResult(res);

      // Save to localStorage history (Data Flow 4)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(res));
        const examMap: Record<string, string> = {
          pcm: 'JEE Main',
          pcb: 'NEET UG',
          commerce_math: 'CA Foundation',
          commerce_nomath: 'CA Foundation',
          humanities: 'CLAT Law',
        };
        localStorage.setItem(
          'ai_edu_stream_advisor_result_v1',
          JSON.stringify({
            recommendedStream: res.topStream.name,
            targetEntranceExam: examMap[res.topStream.id] || 'JEE Main',
            confidenceBand: res.confidenceBand,
            timestamp: Date.now(),
          })
        );
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Failed to save stream result:', err);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    if (result) {
      setPreviousResult(result);
    }
    setSelectedAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">
              Class 10 Stream Selection Advisor
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              100% Deterministic Rubric · Aptitude & Interest Alignment
            </p>
          </div>
        </div>

        {previousResult && !result && (
          <button
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors inline-flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            Compare with Previous Result
          </button>
        )}
      </div>

      {/* ── QUESTION STEPPER VIEW ── */}
      {!result ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)]">
              <span>
                Question {currentIndex + 1} of {items.length}
              </span>
              <span>
                {Math.round(((currentIndex + 1) / items.length) * 100)}% Completed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
              <Badge
                label={(currentQuestion?.metadata as any)?.category || 'Assessment'}
                variant="tier"
              />
              <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                100% Deterministic Rubric
              </span>
            </div>

            <h3 className="text-base font-bold text-[var(--color-text)] leading-relaxed">
              {currentQuestion?.body}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {options.map((opt: any) => {
                const isSelected = currentAnswerId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] font-semibold text-[var(--color-text)] shadow-sm'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <span className="leading-relaxed flex-1">{opt.text}</span>
                    <div
                      className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stepper Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handleNext}
                disabled={!currentAnswerId}
                className="px-5 py-2 text-xs font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {currentIndex === items.length - 1 ? (
                  <>Calculate Result <Sparkles className="w-4 h-4" /></>
                ) : (
                  <>Next Question <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── RESULT VIEW ── */
        <div className="space-y-6">
          {/* Top Recommendation Hero Banner */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-accent)] space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] block">
                  Top Recommended Stream
                </span>
                <h3 className="text-xl font-extrabold text-[var(--color-text)] mt-1">
                  {result.topStream.name}
                </h3>
              </div>
              <Badge label={result.confidenceBand} variant="tier" />
            </div>

            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {result.topStream.description}
            </p>

            {/* Key Subjects */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                Recommended 5-Subject Combination
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.topStream.subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reasoning & Driving Answers List */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Reasoning: Which Answers Drove This Result?
            </h4>
            <div className="space-y-2.5">
              {result.drivingAnswers.map((drv, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[var(--color-text)]">
                      Question {drv.questionIndex} ({drv.category})
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--color-accent)] font-mono">
                      {drv.impact}
                    </span>
                  </div>
                  <p className="text-[var(--color-text-muted)] italic">
                    "{drv.answerText}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Stream Scores Breakdown Bar Chart */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-text)]">
              Match Percentage Across All 5 Stream Options
            </h4>
            <div className="space-y-3">
              {(Object.keys(result.scores) as StreamId[]).map((key) => {
                const sInfo = STREAMS_CATALOG[key];
                const sc = result.scores[key];
                const isTop = key === result.topStream.id;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={isTop ? 'text-[var(--color-accent)] font-bold' : 'text-[var(--color-text)]'}>
                        {sInfo.shortLabel}
                      </span>
                      <span className="font-mono text-[var(--color-text-muted)]">
                        {sc.percentage}% match ({sc.rawScore} pts)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden border border-[var(--color-border)]">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isTop ? 'bg-[var(--color-accent)]' : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                        style={{ width: `${sc.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Paths & Entry Routes */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" /> Career Paths & Typical Entry Routes for {result.topStream.shortLabel}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.topStream.careerPaths.map((cp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs space-y-1"
                >
                  <h5 className="font-bold text-[var(--color-text)]">{cp.title}</h5>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                    <span className="font-semibold text-[var(--color-accent)]">Entry Route:</span> {cp.route}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Guidance Disclaimer (Mandatory per User prompt) */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 space-y-1">
            <span className="font-bold uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Important Guidance Disclaimer
            </span>
            <p className="text-slate-300 leading-relaxed font-medium">
              {result.disclaimer}
            </p>
          </div>

          {/* Retake Action */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={handleRetake}
              className="px-6 py-2.5 text-xs font-bold rounded-xl border border-[var(--color-border)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
