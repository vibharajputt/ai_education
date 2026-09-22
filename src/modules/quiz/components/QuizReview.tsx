// src/modules/quiz/components/QuizReview.tsx
import React, { useState } from 'react';
import type { QuizSessionSummary } from '../types';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Badge } from '@components/Badge';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuizReviewProps {
  summary: QuizSessionSummary;
  onRetake: () => void;
}

export function QuizReview({ summary, onRetake }: QuizReviewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Performance Summary Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-[var(--color-accent)]" />
              <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
                Quiz Complete!
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              Your results and Elo mastery ratings have been saved to the progress store.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-xs transition-opacity"
            >
              <RotateCcw className="w-4 h-4" />
              Take Another Quiz
            </button>
          </div>
        </div>

        {/* 4 Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Score
            </span>
            <div className="text-2xl font-black text-[var(--color-text)] mt-1.5">
              {summary.correctCount} / {summary.totalQuestions}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Accuracy
            </span>
            <div className="text-2xl font-black text-[var(--color-text)] mt-1.5">
              {summary.accuracyPercent}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-500" />
              Total Time
            </span>
            <div className="text-2xl font-black text-[var(--color-text)] mt-1.5">
              {formatTime(summary.totalTimeSec)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-purple-500" />
              Avg Velocity
            </span>
            <div className="text-2xl font-black text-[var(--color-text)] mt-1.5">
              {summary.avgTimePerQuestionSec}s / q
            </div>
          </div>
        </div>

        {/* Concept Elo Updates */}

        {/* SWOT cross-link: only shown when there are incorrect answers */}
        {(summary.totalQuestions - summary.correctCount) > 0 && (
          <div className="pt-3 border-t border-[var(--color-border)]">
            <Link
              to="/school/weak-topics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
            >
              See how this affects your SWOT →
            </Link>
          </div>
        )}
        {summary.conceptChanges.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Concept Mastery (Elo Rating Deltas)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {summary.conceptChanges.map((cc) => (
                <div
                  key={cc.concept}
                  className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--color-text)] line-clamp-1">
                      {cc.concept}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      Mastery: {cc.masteryPercent}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        cc.delta >= 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {cc.delta >= 0 ? `+${cc.delta}` : cc.delta} Elo
                    </span>
                    <div className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
                      {cc.newRating} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Question by Question Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
            Detailed Question Explanations
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            Click any question to view step-by-step worked solutions
          </span>
        </div>

        <div className="space-y-3">
          {summary.questions.map((q, idx) => {
            const isExpanded = expandedIndex === idx;
            const item = q.item;
            const isCorrect = q.isCorrect;
            const explanation =
              (item.metadata?.explanation as any) || (item.metadata?.solution as string) || '';
            const steps = Array.isArray(item.metadata?.steps) ? item.metadata.steps : [];
            const answer =
              (item.metadata?.correctAnswer as string) || (item.metadata?.answer as string) || '';
            const commonMistakes = Array.isArray(item.metadata?.commonMistakes)
              ? item.metadata.commonMistakes
              : [];

            return (
              <div
                key={item.id}
                className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden transition-all shadow-xs"
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text)]">
                        Question {idx + 1}
                      </span>
                      {item.chapter && (
                        <span className="text-xs text-[var(--color-text-muted)] ml-2 hidden sm:inline">
                          • {item.chapter}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={isCorrect ? 'success' : 'danger'}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-[var(--color-border)] space-y-4 bg-[var(--color-bg)]/50">
                    {/* Question Body */}
                    <div className="text-sm text-[var(--color-text)] leading-relaxed">
                      <MarkdownRenderer content={item.body} />
                    </div>

                    {/* Given Answer vs Correct Answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        <span className="font-bold block mb-1">Your Answer:</span>
                        <span>{q.selectedAnswerText || 'Not Attempted'}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                        <span className="font-bold block mb-1">Model Correct Answer:</span>
                        <span>{answer || 'Refer to solution steps below'}</span>
                      </div>
                    </div>

                    {/* Step-by-Step Worked Solution */}
                    {typeof explanation === 'string' && explanation && (
                      <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                        <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider block">
                          Verified Solution:
                        </span>
                        <div className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed">
                          <MarkdownRenderer content={explanation} />
                        </div>
                      </div>
                    )}

                    {steps.length > 0 && (
                      <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                        <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider block">
                          Derivation Breakdown:
                        </span>
                        <div className="space-y-2 text-xs sm:text-sm">
                          {steps.map((st: any, sIdx: number) => (
                            <div key={sIdx} className="space-y-0.5">
                              <span className="font-semibold text-[var(--color-accent)]">
                                {st.label || `Step ${sIdx + 1}`}:
                              </span>
                              <div className="pl-2 text-[var(--color-text)]">
                                <MarkdownRenderer content={st.body || String(st)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {commonMistakes.length > 0 && (
                      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                        <span className="font-bold text-amber-700 dark:text-amber-400 block">
                          Examiner Warning / Common Traps:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                          {commonMistakes.map((cm: string, mIdx: number) => (
                            <li key={mIdx}>{cm}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
