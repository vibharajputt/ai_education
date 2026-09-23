// src/modules/interview-prep/components/InterviewQuiz.tsx
import React, { useState, useEffect } from 'react';
import type { QuizQuestion, TargetRole, InterviewRound } from '../services/questionBank';
import {
  Timer,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  Code2,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface InterviewQuizProps {
  questions: QuizQuestion[];
  roleTitle: string;
  roundTitle: string;
  candidateName: string;
  onFinish: (results: {
    answers: Record<string, number | string>;
    timeSpentSeconds: number;
  }) => void;
  onCancel: () => void;
}

export function InterviewQuiz({
  questions,
  roleTitle,
  roundTitle,
  candidateName,
  onFinish,
  onCancel,
}: InterviewQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [starTextAnswers, setStarTextAnswers] = useState<Record<string, { situation: string; task: string; action: string; result: string }>>({});
  const [secondsLeft, setSecondsLeft] = useState(questions.length * 90); // 90 seconds per question
  const [showHint, setShowHint] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const isLast = currentIndex === questions.length - 1;
  const isAnswered = userAnswers[currentQ.id] !== undefined || (starTextAnswers[currentQ.id]?.action?.length ?? 0) > 10;

  // Sections list for header tabs
  const sections = Array.from(new Set(questions.map((q) => q.section)));

  const handleSelectOption = (optIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
  };

  const handleStarChange = (field: 'situation' | 'task' | 'action' | 'result', val: string) => {
    setStarTextAnswers((prev) => {
      const current = prev[currentQ.id] || { situation: '', task: '', action: '', result: '' };
      const updated = { ...current, [field]: val };
      return { ...prev, [currentQ.id]: updated };
    });
    // Mark as answered
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: 'STAR_SUBMITTED',
    }));
  };

  const handleNext = () => {
    setShowHint(false);
    if (isLast) {
      onFinish({
        answers: userAnswers,
        timeSpentSeconds: questions.length * 90 - secondsLeft,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Controls & Navigation Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {roundTitle.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {roleTitle}
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              Candidate: <strong className="text-[var(--color-text)]">{candidateName}</strong>
            </p>
          </div>

          {/* Timer and Progress counter */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold font-mono">
              <Timer className="w-4 h-4" />
              <span>{formatTime(secondsLeft)}</span>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[var(--color-text-muted)] hover:text-red-500 font-bold px-2.5 py-1"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]">
          {sections.map((secName) => {
            const isCurrentSec = currentQ.section === secName;
            const secQuestions = questions.filter((q) => q.section === secName);
            const secAnswered = secQuestions.filter((q) => userAnswers[q.id] !== undefined).length;

            return (
              <div
                key={secName}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  isCurrentSec
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                }`}
              >
                <span>{secName}</span>
                <span className="text-[10px] opacity-80 font-mono">
                  ({secAnswered}/{secQuestions.length})
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-[var(--color-surface-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--color-border)]">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md space-y-6">
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              Q{currentIndex + 1}
            </span>
            <div>
              <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 block">
                {currentQ.section}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                Skill Domain: {currentQ.skillTag}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[var(--color-text-muted)]">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Question Body */}
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-black text-[var(--color-text)] leading-snug">
            {currentQ.title}
          </h2>
          <p className="text-sm text-[var(--color-text)] leading-relaxed font-medium">
            {currentQ.question}
          </p>
        </div>

        {/* Multiple Choice Options if available */}
        {currentQ.options && currentQ.options.length > 0 && (
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = userAnswers[currentQ.id] === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-blue-500/30 text-[var(--color-text)]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* STAR Framework Builder for Behavioral / HR Questions */}
        {currentQ.starGuide && (
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>HR Behavioral Question — Frame your response using the STAR Framework (or summarize your points):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-[var(--color-text-muted)] mb-1">
                  1. Situation (Context & Challenge)
                </label>
                <textarea
                  rows={2}
                  placeholder="Where were you and what was the situation?"
                  value={starTextAnswers[currentQ.id]?.situation || ''}
                  onChange={(e) => handleStarChange('situation', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-[var(--color-text-muted)] mb-1">
                  2. Task (Your Objective & Role)
                </label>
                <textarea
                  rows={2}
                  placeholder="What was your specific goal or deliverable?"
                  value={starTextAnswers[currentQ.id]?.task || ''}
                  onChange={(e) => handleStarChange('task', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-[var(--color-text-muted)] mb-1">
                  3. Action (Step-by-Step Actions You Took)
                </label>
                <textarea
                  rows={2}
                  placeholder="What specific actions or engineering decisions did you execute?"
                  value={starTextAnswers[currentQ.id]?.action || ''}
                  onChange={(e) => handleStarChange('action', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-[var(--color-text-muted)] mb-1">
                  4. Result (Quantifiable Business Impact)
                </label>
                <textarea
                  rows={2}
                  placeholder="What was the measurable outcome and key learning?"
                  value={starTextAnswers[currentQ.id]?.result || ''}
                  onChange={(e) => handleStarChange('result', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Evaluation Criteria Box */}
        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-[var(--color-text-muted)] flex items-start gap-2">
          <Award className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text)] font-bold">Interviewer Evaluation Criteria: </strong>
            <span>{currentQ.evalCriteria}</span>
          </div>
        </div>

        {/* Action Controls: Previous / Next / Finish */}
        <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)] hover:text-amber-500 px-3 py-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 ${
                isLast
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              <span>{isLast ? 'Complete & View Results' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showHint && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
            💡 <strong>Interviewer Hint:</strong> Think about edge cases, time-space complexity trade-offs, and clear communication structuring!
          </div>
        )}
      </div>
    </div>
  );
}
