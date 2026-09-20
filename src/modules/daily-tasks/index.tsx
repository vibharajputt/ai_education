import React, { useState, useEffect, useMemo } from 'react';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import { useProgressStore } from '@core/progress';
import {
  StateShell,
  Card,
  Badge,
  StatTile,
  ProgressRing,
} from '../../components';
import {
  Flame,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  Zap,
} from 'lucide-react';

type DailyTaskItem = ContentItem & {
  metadata?: {
    dayNumber?: number;
    estimatedMins?: number;
    difficultyTier?: string;
    targetModule?: string;
    taskTitle?: string;
    taskDescription?: string;
  };
};

const STORAGE_KEY = 'ai_edu_daily_tasks_completed_v1';

export const DailyTasksModule: React.FC = () => {
  const { collection, items, loading, error } = useCollection('daily-tasks.json');
  const { streakStats, conceptMastery, dueItems } = useProgressStore();
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const taskItems = useMemo(() => items as DailyTaskItem[], [items]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompletedTasks(JSON.parse(saved));
      }
    } catch {
      // Ignore fallback
    }
  }, []);

  const toggleTaskCompleted = (id: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore fallback
      }
      return next;
    });
  };

  const avgElo = useMemo(() => {
    if (conceptMastery.length === 0) return 1200;
    const sum = conceptMastery.reduce((acc, curr) => acc + curr.elo, 0);
    return Math.round(sum / conceptMastery.length);
  }, [conceptMastery]);

  const adaptiveDifficultyTier = useMemo(() => {
    if (avgElo >= 1400) return 'Advanced Challenge';
    if (avgElo >= 1150) return 'Standard Practice';
    return 'Easy Focus';
  }, [avgElo]);

  const filteredItems = useMemo(() => {
    return taskItems.filter((item) => {
      if (selectedTier === 'all') return true;
      return item.metadata?.difficultyTier === selectedTier;
    });
  }, [taskItems, selectedTier]);

  if (loading || error || !collection) {
    return (
      <StateShell
        status={loading ? 'loading' : error ? 'error' : 'empty'}
        error={error}
      />
    );
  }

  const totalTasks = taskItems.length;
  const completedCount = taskItems.filter((i) => completedTasks[i.id]).length;
  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-900/30 to-background border border-amber-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label="B" variant="tier" />
              <Badge label="both" variant="track" />
              <span className="text-xs text-[var(--color-text-muted)] font-mono font-medium">
                {collection.scopeLabel}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)]">
              {collection.title}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] max-w-2xl">
              {collection.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[var(--color-surface)]/80 p-3 rounded-xl border border-amber-500/30">
            <ProgressRing value={completionPct} size={64} strokeWidth={6} label={`${completionPct}%`} />
            <div>
              <span className="text-xs text-[var(--color-text-muted)] font-semibold block uppercase">
                Daily Completion
              </span>
              <span className="text-sm font-bold text-[var(--color-text)]">
                {completedCount} of {totalTasks} Tasks Done
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatTile
            label="Active Streak"
            value={`${streakStats.currentStreak} Days`}
            icon={<Flame className="w-4 h-4 text-amber-400" />}
          />
          <StatTile
            label="Adaptive Elo Level"
            value={avgElo}
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          />
          <StatTile
            label="Recommended Tier"
            value={adaptiveDifficultyTier}
            icon={<Zap className="w-4 h-4 text-indigo-400" />}
          />
          <StatTile
            label="Due Revision Queue"
            value={`${dueItems.length} Items`}
            icon={<Target className="w-4 h-4 text-rose-400" />}
          />
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto">
        {[
          { id: 'all', label: `All Tasks (${taskItems.length})` },
          { id: 'Easy Focus', label: 'Easy Focus' },
          { id: 'Standard Practice', label: 'Standard Practice' },
          { id: 'Advanced Challenge', label: 'Advanced Challenge' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedTier(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              selectedTier === tab.id
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Checklist Grid */}
      <div className="space-y-4">
        {filteredItems.map((item: DailyTaskItem) => {
          const isDone = !!completedTasks[item.id];
          const taskTitle = item.metadata?.taskTitle || item.body;
          const taskDesc = item.metadata?.taskDescription || item.body;
          const mins = item.metadata?.estimatedMins || 15;
          const tier = item.metadata?.difficultyTier || 'Standard Practice';
          const targetModule = item.metadata?.targetModule || 'quiz';

          const isRecommended = tier === adaptiveDifficultyTier;

          return (
            <Card
              key={item.id}
              className={`p-5 transition-all space-y-4 border ${
                isDone
                  ? 'bg-emerald-950/10 border-emerald-500/30 opacity-80'
                  : isRecommended
                  ? 'border-amber-500/40 bg-amber-950/10 shadow-sm'
                  : 'hover:border-amber-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleTaskCompleted(item.id)}
                    className="mt-1 w-5 h-5 rounded border-amber-500/50 text-amber-500 focus:ring-amber-500/50 cursor-pointer shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-base font-bold ${isDone ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                        {taskTitle}
                      </span>

                      {isRecommended && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Recommended for your Elo
                        </span>
                      )}

                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/15 text-indigo-400">
                        {tier}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      {taskDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>~{mins} mins</span>
                  </div>

                  <a
                    href={`/#/${item.track}/${targetModule}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
