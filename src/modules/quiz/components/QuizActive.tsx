// src/modules/quiz/components/QuizActive.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { QuizQuestion } from '../types';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Badge } from '@components/Badge';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
} from 'lucide-react';

interface QuizActiveProps {
  questions: QuizQuestion[];
  timeLimitSec: number;
  onAnswerQuestion: (index: number, optionIndex: number, text: string) => void;
  onToggleFlag: (index: number) => void;
  onSubmit: () => void;
}

export function QuizActive({
  questions,
  timeLimitSec,
  onAnswerQuestion,
  onToggleFlag,
  onSubmit,
}: QuizActiveProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer tick
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      onSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          onSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onSubmit]);

  const currentQ = questions[currentIndex];
  const item = currentQ.item;
  const rawOptions = (item.metadata?.options as string[]) || [];

  // Default fallback MCQ options if item has none
  const options =
    rawOptions.length > 0
      ? rawOptions
      : [
          (item.metadata?.answer as string) || (item.metadata?.correctAnswer as string) || 'Option A (Correct Concept)',
          'Option B (Alternative Formula)',
          'Option C (Incorrect Magnitude)',
          'Option D (Opposite Direction)',
        ];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = questions.filter((q) => q.selectedOptionIndex !== undefined).length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isLowTime = timeLeft < 60;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span>•</span>
            <span>{answeredCount} Answered</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm border transition-colors ${
              isLowTime
                ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-xs transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finish & Submit</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Palette + Question View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center: Active Question */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 sm:p-7 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
            {/* Question Header Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                  Q{currentIndex + 1}
                </span>
                {item.chapter && (
                  <span className="text-xs font-medium text-[var(--color-text-muted)] line-clamp-1">
                    {item.chapter}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFlag(currentIndex)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    currentQ.flaggedForReview
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 fill-current" />
                  <span>{currentQ.flaggedForReview ? 'Flagged' : 'Flag'}</span>
                </button>

                <Badge
                  variant={
                    item.difficulty === 'hard'
                      ? 'danger'
                      : item.difficulty === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {item.difficulty || 'medium'}
                </Badge>
              </div>
            </div>

            {/* Question Body with KaTeX */}
            <div className="text-sm sm:text-base leading-relaxed text-[var(--color-text)]">
              <MarkdownRenderer content={item.body} />
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {options.map((opt, oIdx) => {
                const isSelected = currentQ.selectedOptionIndex === oIdx;
                const letter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => onAnswerQuestion(currentIndex, oIdx, opt)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] shadow-xs ring-1 ring-[var(--color-accent)]'
                        : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <span
                      className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="flex-1 text-xs sm:text-sm text-[var(--color-text)] leading-snug">
                      <MarkdownRenderer content={opt} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-40 text-xs sm:text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                Review & Finish
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-xs transition-opacity"
              >
                Next Question
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Palette Grid (Desktop/Tablet) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
              <h4 className="font-bold text-xs sm:text-sm text-[var(--color-text)]">
                Question Navigator
              </h4>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">
                {answeredCount}/{questions.length} Solved
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const isAnswered = q.selectedOptionIndex !== undefined;
                const isFlagged = q.flaggedForReview;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center relative transition-all ${
                      isCurrent
                        ? 'ring-2 ring-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-xs'
                        : isAnswered
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-[var(--color-surface)]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)]" />
                <span>Unattempted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[var(--color-accent)]" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-20">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-[var(--color-text)]">Submit Quiz?</h3>
            </div>

            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              You have answered <strong className="text-[var(--color-text)]">{answeredCount}</strong> of{' '}
              <strong className="text-[var(--color-text)]">{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && (
                <span className="block mt-1 text-rose-500">
                  {questions.length - answeredCount} unanswered questions will be marked as incorrect.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs sm:text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              >
                Keep Solving
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  onSubmit();
                }}
                className="px-5 py-2 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-sm"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
