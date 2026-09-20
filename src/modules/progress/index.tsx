// src/modules/progress/index.tsx
// Tier B Progress & Mastery Dashboard Module.

import React from 'react';
import { useProgressStore, resetStore } from '@core/progress';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { EmptyState } from '@components/EmptyState';
import { TrendingUp, Award, Flame, Clock, RefreshCw, Layers, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { progressConfig } from './config';
import { Link } from 'react-router-dom';

export const ProgressModule: React.FC = () => {
  const {
    attempts,
    conceptMastery,
    streakStats,
    accuracyTrend,
    timeTrend,
    dueItems,
    swotAnalysis,
  } = useProgressStore();

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all practice data? This will clear attempts and Elo ratings.')) {
      resetStore();
    }
  };

  const isEmpty = attempts.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Scope Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--color-accent)]" />
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
              {progressConfig.title}
            </h1>
            <Badge label="Tier B • Analytics" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" />
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            {progressConfig.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Store
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <span>Scope: {progressConfig.scopeLabel}</span>
          </div>
        </div>
      </div>

      {/* First-Run Designed Empty State */}
      {isEmpty ? (
        <Card className="p-8">
          <EmptyState
            icon={<TrendingUp className="w-8 h-8 text-[var(--color-accent)]" />}
            title="No Practice Attempts Recorded Yet"
            description="Your progress store is currently empty. Complete a Daily Practice Quiz or Worksheet to start indexing Elo concept mastery ratings, accuracy trends, and spaced repetition queues."
            action={{
              label: 'Start First Practice Quiz',
              onClick: () => {
                if (typeof window !== 'undefined') window.location.hash = '#/school/quiz';
              },
            }}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[var(--color-accent)]" /> Attempted
              </div>
              <div className="text-2xl font-black text-[var(--color-text)]">{swotAnalysis.totalAttempted} Questions</div>
              <div className="text-[11px] text-emerald-500 font-bold">{swotAnalysis.totalCorrect} Correct ({swotAnalysis.overallAccuracyPct}%)</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Active Streak
              </div>
              <div className="text-2xl font-black text-amber-500">{streakStats.currentStreak} Days</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Max Record: {streakStats.maxStreak} Days</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-500" /> Speed Pace
              </div>
              <div className="text-2xl font-black text-[var(--color-text)]">{swotAnalysis.avgTimePerQuestionSec}s / q</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Target: &lt;45s per question</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-purple-500" /> FSRS Revision Due
              </div>
              <div className="text-2xl font-black text-purple-500">{dueItems.length} Items</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Spaced Repetition Queue</div>
            </Card>
          </div>

          {/* Concept Mastery Heat Strip */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)]">Concept Mastery Heat Strip (Elo Rating Engine)</h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Elo ratings calculated dynamically (Mastered: &ge;1350 Elo, Weak: &le;1100 Elo).
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--color-accent)]">{conceptMastery.length} Concepts Tracked</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {conceptMastery.map((cm) => {
                let heatStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
                let statusBadge = <Badge label="Mastered" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" />;
                if (cm.status === 'weak') {
                  heatStyle = 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300';
                  statusBadge = <Badge label="Weak" className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" />;
                } else if (cm.status === 'learning') {
                  heatStyle = 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300';
                  statusBadge = <Badge label="Learning" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" />;
                }

                return (
                  <div key={cm.conceptTag} className={`p-3.5 rounded-xl border text-xs space-y-2 ${heatStyle}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate max-w-[160px]">{cm.conceptTag}</span>
                      {statusBadge}
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span>Elo: {cm.elo}</span>
                      <span>Accuracy: {cm.accuracyPct}% ({cm.correctCount}/{cm.attemptsCount})</span>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
                      <div
                        className="h-full bg-current transition-all"
                        style={{ width: `${Math.min(100, Math.max(10, ((cm.elo - 800) / 1000) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Accuracy & Time Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accuracy Trend Bar Chart */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text)]">Accuracy Trend Across Practice Days</h3>
              <div className="space-y-3 pt-2">
                {accuracyTrend.length > 0 ? (
                  accuracyTrend.map((at) => (
                    <div key={at.date} className="space-y-1">
                      <div className="flex justify-between text-xs text-[var(--color-text)] font-semibold">
                        <span>{at.date} ({at.attempts} q)</span>
                        <span className="font-bold text-[var(--color-accent)]">{at.accuracyPct}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden border border-[var(--color-border)]">
                        <div
                          className="h-full bg-[var(--color-accent)] transition-all"
                          style={{ width: `${at.accuracyPct}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] italic">Attempt quizzes to generate trend charts.</p>
                )}
              </div>
            </Card>

            {/* Time-per-Question Speed Metrics */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text)]">Time-per-Question Speed Trend</h3>
              <div className="space-y-3 pt-2">
                {timeTrend.length > 0 ? (
                  timeTrend.map((tt) => (
                    <div key={tt.session} className="space-y-1">
                      <div className="flex justify-between text-xs text-[var(--color-text)] font-semibold">
                        <span>{tt.session}</span>
                        <span className="font-bold text-sky-500">{tt.avgTimeSec}s avg</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden border border-[var(--color-border)]">
                        <div
                          className="h-full bg-sky-500 transition-all"
                          style={{ width: `${Math.min(100, (tt.avgTimeSec / 90) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] italic">Attempt quizzes to record time metrics.</p>
                )}
              </div>
            </Card>
          </div>

          {/* FSRS Spaced Repetition Due Queue */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">Due-for-Revision Spaced Repetition Queue (FSRS)</h3>
              </div>
              <Link
                to="/school/quiz"
                className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold flex items-center gap-1"
              >
                Practice Due Items <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dueItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dueItems.map((item) => (
                  <div key={item.itemId} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1.5">
                    <div className="font-bold text-purple-700 dark:text-purple-300 truncate">Item: {item.itemId}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      Reps: {item.reps} • Stability: {item.stability} days
                    </div>
                    <div className="text-[10px] font-semibold text-rose-500">
                      Due: {new Date(item.dueTimestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> All spaced repetition items are up to date! Great job.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
