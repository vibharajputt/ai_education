// src/modules/interview-prep/components/InterviewResult.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { QuizQuestion } from '../services/questionBank';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Target,
  ShieldAlert,
  Flame,
  BarChart3,
  Lightbulb,
  Award,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface InterviewResultProps {
  questions: QuizQuestion[];
  answers: Record<string, number | string>;
  timeSpentSeconds: number;
  roleTitle: string;
  candidateName: string;
  onRetake: () => void;
}

export function InterviewResult({
  questions,
  answers,
  timeSpentSeconds,
  roleTitle,
  candidateName,
  onRetake,
}: InterviewResultProps) {
  // Compute score for MCQ questions
  let totalScoreable = 0;
  let correctCount = 0;

  const sectionPerformance: Record<string, { total: number; correct: number }> = {};

  questions.forEach((q) => {
    if (!sectionPerformance[q.section]) {
      sectionPerformance[q.section] = { total: 0, correct: 0 };
    }

    if (q.options && q.correctOptionIndex !== undefined) {
      totalScoreable += 1;
      sectionPerformance[q.section].total += 1;
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
        sectionPerformance[q.section].correct += 1;
      }
    } else {
      // STAR behavioral or open response counts as completed if answered
      sectionPerformance[q.section].total += 1;
      if (answers[q.id]) {
        sectionPerformance[q.section].correct += 1;
      }
    }
  });

  const readinessPercent = totalScoreable > 0
    ? Math.round((correctCount / totalScoreable) * 100)
    : 85;

  const getReadinessLevel = (pct: number) => {
    if (pct >= 80) return { label: 'Strong Hire Candidate', badge: 'bg-emerald-500 text-white', color: 'text-emerald-600' };
    if (pct >= 60) return { label: 'Good Candidate (Minor Gaps)', badge: 'bg-amber-500 text-white', color: 'text-amber-600' };
    return { label: 'Needs Remedial Practice', badge: 'bg-rose-500 text-white', color: 'text-rose-600' };
  };

  const readiness = getReadinessLevel(readinessPercent);

  // Extract strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  questions.forEach((q) => {
    if (q.options && q.correctOptionIndex !== undefined) {
      if (answers[q.id] === q.correctOptionIndex) {
        strengths.push(q.skillTag);
      } else {
        weaknesses.push(q.skillTag);
      }
    } else if (answers[q.id]) {
      strengths.push(q.skillTag);
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ── TOP SCORECARD HERO ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Trophy className="w-4 h-4 fill-amber-300" />
              <span>Interview Evaluation Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {candidateName}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200">
              Target Profile: <strong className="text-white">{roleTitle}</strong> • Time Taken: {Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s
            </p>
          </div>

          {/* Big Score Ring */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0">
            <span className="text-3xl sm:text-4xl font-black text-amber-300">
              {readinessPercent}%
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mt-1.5 ${readiness.badge}`}>
              {readiness.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── HIGH PRIORITY SWOT REDIRECT BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 sm:p-8 text-white shadow-xl border border-purple-400/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-black uppercase tracking-wider text-amber-200">
              <Target className="w-3.5 h-3.5 text-amber-300" />
              <span>Next Strategic Step</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Deep-Dive Your Interview Gaps in SWOT Matrix
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-xl">
              Aapke is interview score aur weaknesses ke basis par, aapka personalized <strong>SWOT Diagnostic Matrix</strong> aur <strong>3-Day Remedial Action Plan</strong> taiyaar hai. Apni strength aur weak areas ka forensic audit check karein!
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              to="/college/weak-topics"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-purple-900 hover:bg-amber-300 hover:text-purple-950 font-black text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>Open SWOT Diagnostic Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── SECTION-BY-SECTION MASTERY BREAKDOWN ── */}
      <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Section-Wise Performance Radar</span>
          </h3>
          <span className="text-xs font-bold text-[var(--color-text-muted)]">
            {Object.keys(sectionPerformance).length} Evaluated Sections
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(sectionPerformance).map(([secTitle, data]) => {
            const secPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 100;

            return (
              <div key={secTitle} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--color-text)]">{secTitle}</span>
                  <span className={secPct >= 75 ? 'text-emerald-600' : 'text-amber-600'}>
                    {data.correct}/{data.total} Scored ({secPct}%)
                  </span>
                </div>
                <div className="w-full bg-[var(--color-surface-subtle)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      secPct >= 75
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${secPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── IDENTIFIED STRENGTHS & WEAKNESSES CHIPS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths ({strengths.length})</span>
          </div>
          {strengths.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {strengths.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Complete more modules to uncover strengths.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Target Weak Areas ({weaknesses.length})</span>
          </div>
          {weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {weaknesses.map((w, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-800 dark:text-rose-200 border border-rose-500/30"
                >
                  ⚠ {w}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Zero critical gaps detected in this set!</p>
          )}
        </div>
      </div>

      {/* ── QUESTION-BY-QUESTION MODEL ANSWER REVIEW ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Interviewer Model Answers & Rubric Walkthrough</span>
        </h3>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = q.options && q.correctOptionIndex !== undefined
              ? userAns === q.correctOptionIndex
              : true;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {q.section} • {q.skillTag}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[var(--color-text)] leading-snug">
                      {q.title}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)]">{q.question}</p>
                  </div>

                  {q.options && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          Review Needed
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Explanation & Ideal Answer */}
                <div className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2 text-xs">
                  <div className="text-[var(--color-text)] font-medium">
                    <strong className="text-blue-600 dark:text-blue-400">Recruiter Blueprint: </strong>
                    {q.explanation}
                  </div>

                  {q.idealAnswer && (
                    <div className="text-[var(--color-text)] pt-1 border-t border-[var(--color-border)]/60">
                      <strong className="text-purple-600 dark:text-purple-400">Model Response: </strong>
                      {q.idealAnswer}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retake Action Button */}
      <div className="pt-4 flex justify-center">
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-text)] shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake or Switch Target Job Role</span>
        </button>
      </div>
    </div>
  );
}
