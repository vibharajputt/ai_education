// src/modules/quiz/index.tsx
// Tier B Interactive Practice Quiz Module feeding attempts into progress store.

import React, { useState, useEffect, useRef } from 'react';
import { useCollection } from '@core/loaders';
import { recordAttempt } from '@core/progress';
import { StateShell } from '@components/StateShell';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { HelpCircle, Clock, CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, Play } from 'lucide-react';
import { quizConfig } from './config';

export const QuizModule: React.FC = () => {
  const { items, loading, error, reload } = useCollection(quizConfig.dataSource);

  // Quiz State
  const [quizState, setQuizState] = useState<'setup' | 'active' | 'review'>('setup');
  const [selectedMode, setSelectedMode] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [activeQuestions, setActiveQuestions] = useState<typeof items>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, { selected: string; correct: boolean; timeTakenSec: number }>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Timer
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number>(0);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Live Timer Counter
  useEffect(() => {
    if (quizState !== 'active') return;
    const interval = setInterval(() => {
      setElapsedTimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizState]);

  // Start Quiz Handler
  const handleStartQuiz = (mode: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    if (items.length === 0) return;

    setSelectedMode(mode);
    let count = 10;
    if (mode === 'weekly') count = 25;
    else if (mode === 'monthly') count = 50;

    const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length));
    setActiveQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setElapsedTimeSec(0);
    questionStartTimeRef.current = Date.now();
    setQuizState('active');
  };

  // Option Submit Handler (Feeds attempt into progress store immediately!)
  const handleSubmitAnswer = (optionValue: string) => {
    if (isAnswerSubmitted) return;

    setSelectedOption(optionValue);
    setIsAnswerSubmitted(true);

    const currentItem = activeQuestions[currentIndex];
    const correctOption = (currentItem.metadata?.correctAnswer as string) || (currentItem.metadata?.options as any)?.[0] || 'A';
    const isCorrect = optionValue.toLowerCase() === correctOption.toLowerCase() || optionValue === (currentItem.metadata?.answerKey as string);

    const timeTakenSec = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: { selected: optionValue, correct: isCorrect, timeTakenSec },
    }));

    // Record attempt directly into progress.ts store!
    recordAttempt({
      itemId: currentItem.id,
      conceptTags: currentItem.concepts.length > 0 ? currentItem.concepts : [currentItem.chapter || 'STEM'],
      subject: currentItem.subject || 'STEM',
      correct: isCorrect,
      timeTakenSec,
      sourceModule: 'quiz',
    });
  };

  // Next Question Handler
  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      questionStartTimeRef.current = Date.now();
    } else {
      setQuizState('review');
    }
  };

  if (loading || error || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <StateShell
          status={loading ? 'loading' : error ? 'error' : 'empty'}
          error={error}
          onRetry={reload}
        />
      </div>
    );
  }

  const currentItem = activeQuestions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Scope Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[var(--color-accent)]" />
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
              {quizConfig.title}
            </h1>
            <Badge label="Tier B • Practice Quiz" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" />
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            {quizConfig.description}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          <span>Scope: {quizConfig.scopeLabel}</span>
        </div>
      </div>

      {/* SETUP STAGE: Mode Selection */}
      {quizState === 'setup' && (
        <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Choose Practice Mode</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Select a quiz duration to start practice. Attempts update Elo mastery ratings in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Daily Practice */}
            <div
              onClick={() => handleStartQuiz('daily')}
              className="p-5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                  Daily Quiz (10 Questions)
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  10-minute quick diagnostic session across core chapters.
                </p>
              </div>
            </div>

            {/* Weekly Test */}
            <div
              onClick={() => handleStartQuiz('weekly')}
              className="p-5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                  Weekly Test (25 Questions)
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Comprehensive 25-question test for weekly retention tracking.
                </p>
              </div>
            </div>

            {/* Monthly Challenge */}
            <div
              onClick={() => handleStartQuiz('monthly')}
              className="p-5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                  Monthly Challenge (50 Questions)
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Full Board Exam mock simulation with FSRS queue prioritization.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ACTIVE STAGE: One Question Per Screen on Mobile */}
      {quizState === 'active' && currentItem && (
        <Card className="p-6 space-y-6">
          {/* Active Quiz Header Controls */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[var(--color-accent)] text-white font-bold">
                Q {currentIndex + 1} of {activeQuestions.length}
              </span>
              <span className="text-[var(--color-text-muted)]">
                {currentItem.chapter ? `Chapter: ${currentItem.chapter}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[var(--color-text)] font-mono font-bold">
              <Clock className="w-4 h-4 text-[var(--color-accent)] animate-pulse" />
              <span>
                {Math.floor(elapsedTimeSec / 60)}:{(elapsedTimeSec % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <div className="text-sm md:text-base font-bold text-[var(--color-text)] leading-relaxed">
              <MarkdownRenderer content={currentItem.body} />
            </div>

            {currentItem.latex && (
              <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)]">
                ${currentItem.latex}$
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {((currentItem.metadata?.options as string[]) || ['A', 'B', 'C', 'D']).map((opt, idx) => {
              const optLabel = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === optLabel || selectedOption === opt;
              const correctOpt = (currentItem.metadata?.correctAnswer as string) || 'A';
              const isCorrectOpt = optLabel.toLowerCase() === correctOpt.toLowerCase() || opt === (currentItem.metadata?.answerKey as string);

              let optionStyle = 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] hover:border-[var(--color-accent)]';
              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                }
              }

              return (
                <button
                  type="button"
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSubmitAnswer(optLabel)}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs md:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs shrink-0">
                      {optLabel}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswerSubmitted && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {isAnswerSubmitted && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Footer when Answered */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="font-bold text-[var(--color-accent)] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Explanation & Concept Walkthrough
              </div>
              <p className="text-[var(--color-text)] leading-relaxed">
                {(currentItem.metadata?.solution as string) ||
                  (currentItem.metadata?.explanation as string) ||
                  'The answer follows directly from core governing principles and unit conversion rules.'}
              </p>
            </div>
          )}

          {/* Next / Complete Controls */}
          {isAnswerSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {currentIndex < activeQuestions.length - 1 ? (
                  <>
                    Next Question <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  'View Final Results'
                )}
              </button>
            </div>
          )}
        </Card>
      )}

      {/* REVIEW STAGE: Performance & Explanations */}
      {quizState === 'review' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[var(--color-text)]">Quiz Complete!</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                All attempts have been saved to your progress store and Elo ratings updated.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setQuizState('setup')}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Practice Another Quiz
            </button>
          </div>

          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border text-center space-y-1">
              <div className="text-xs text-[var(--color-text-muted)]">Score</div>
              <div className="text-xl font-black text-[var(--color-accent)]">
                {Object.values(userAnswers).filter((u) => u.correct).length} / {activeQuestions.length}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border text-center space-y-1">
              <div className="text-xs text-[var(--color-text-muted)]">Accuracy</div>
              <div className="text-xl font-black text-emerald-500">
                {Math.round((Object.values(userAnswers).filter((u) => u.correct).length / activeQuestions.length) * 100)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border text-center space-y-1">
              <div className="text-xs text-[var(--color-text-muted)]">Total Time</div>
              <div className="text-xl font-black text-[var(--color-text)]">
                {Math.floor(elapsedTimeSec / 60)}m {elapsedTimeSec % 60}s
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border text-center space-y-1">
              <div className="text-xs text-[var(--color-text-muted)]">Avg / Question</div>
              <div className="text-xl font-black text-sky-500">
                {Math.round(elapsedTimeSec / activeQuestions.length)}s
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-[var(--color-text)]">Question Review & Explanations</h3>
            <div className="space-y-3">
              {activeQuestions.map((q, idx) => {
                const ans = userAnswers[idx];
                const isCorrect = ans?.correct;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        <span>Q{idx + 1}. {q.chapter || 'STEM'}</span>
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">{ans?.timeTakenSec || 0}s taken</span>
                    </div>

                    <div className="text-[var(--color-text)] font-semibold leading-relaxed">
                      <MarkdownRenderer content={q.body} />
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--color-surface)] border text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                      <span className="font-bold text-[var(--color-accent)] block mb-0.5">Explanation:</span>
                      {(q.metadata?.solution as string) || (q.metadata?.explanation as string) || 'Standard solution principles apply.'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
