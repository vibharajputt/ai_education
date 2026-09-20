import React, { useState, useEffect } from 'react';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Calendar, ListFilter, CheckSquare, Square, RefreshCw, AlertTriangle, Clock, BookOpen, CheckCircle2, Flame, Target } from 'lucide-react';
import { SyllabusPlanResult, replanSchedule } from '../utils/syllabusScheduler';
import { useProgressStore } from '@core/progress';

interface CalendarPlanViewProps {
  plan: SyllabusPlanResult;
  onUpdatePlan: (updatedPlan: SyllabusPlanResult) => void;
}

export const CalendarPlanView: React.FC<CalendarPlanViewProps> = ({ plan, onUpdatePlan }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { conceptMastery } = useProgressStore();

  const weakConcepts = conceptMastery.filter((c) => c.status === 'weak');

  // Load completed block IDs from localStorage
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`syllabus_plan_completed_${plan.planId}`);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(`syllabus_plan_completed_${plan.planId}`, JSON.stringify(Array.from(completedBlocks)));
  }, [completedBlocks, plan.planId]);

  const toggleBlockCompleted = (blockId: string) => {
    setCompletedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  // Calculate totals & completion percentage
  let totalBlocks = 0;
  let completedCount = 0;

  plan.days.forEach((day) => {
    day.blocks.forEach((block) => {
      totalBlocks++;
      if (completedBlocks.has(block.id)) {
        completedCount++;
      }
    });
  });

  const completionPercent = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;

  const handleReplan = () => {
    const replanned = replanSchedule(plan, completedBlocks);
    onUpdatePlan(replanned);
  };

  return (
    <div className="space-y-6">
      {/* Plan Header Stats & View Toggle Controls */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[var(--color-text)]">Target Deadline: {plan.deadlineDate}</h3>
              <Badge label={`${plan.hoursPerDay} Hours / Day Cap`} className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Total Required: {plan.totalRequiredHours}h • Timeline Available: {plan.totalAvailableHours}h
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Calendar vs List View Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Calendar View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" /> List View
              </button>
            </div>

            {/* Re-plan Button */}
            <button
              type="button"
              onClick={handleReplan}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Re-plan Schedule
            </button>
          </div>
        </div>

        {/* Progress Bar & Checkbox Completion Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--color-text)] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Syllabus Completion Progress: {completedCount} of {totalBlocks} Tasks ({completionPercent}%)
            </span>
            <span className="text-[var(--color-text-muted)]">{totalBlocks - completedCount} Tasks Remaining</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden border border-[var(--color-border)]">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-500 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Dropped Units Banner (if total hours exceeded deadline) */}
      {plan.droppedUnits.length > 0 && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {plan.droppedUnits.length} Syllabus Unit{plan.droppedUnits.length === 1 ? '' : 's'} Dropped (Strict {plan.hoursPerDay}h/day Constraint)
            </span>
          </div>
          <p className="text-xs text-[var(--color-text)] leading-relaxed">
            The following lower-priority units could not fit before your target deadline without exceeding your daily study limit ({plan.hoursPerDay} hours/day):
          </p>
          <div className="space-y-2">
            {plan.droppedUnits.map((du, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs space-y-1"
              >
                <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                  <span>Unit: {du.unitTitle}</span>
                  <Badge label="Dropped" className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" />
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] italic">
                  Reason: {du.reason}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weak Concept Remediation Banner (Data Flow 1) */}
      {weakConcepts.length > 0 && (
        <Card className="p-4 bg-rose-500/10 border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
            <Target className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              {weakConcepts.length} Weak Concept Remediation Block{weakConcepts.length === 1 ? '' : 's'} Auto-Scheduled in Study Plan
            </span>
          </div>
          <p className="text-xs text-[var(--color-text)] leading-relaxed">
            Your progress store identified weak Elo mastery ratings in: <strong className="text-rose-400 font-mono">{weakConcepts.map((c) => c.conceptTag).join(', ')}</strong>. Next-day study blocks have been re-prioritized for formula mnemonics & step breakdowns.
          </p>
        </Card>
      )}

      {/* View Content: Calendar Grid vs List View */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plan.days.map((day) => (
            <Card
              key={day.dayNumber}
              className="p-4 space-y-3 flex flex-col justify-between border-t-4 border-t-[var(--color-accent)]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-extrabold text-[var(--color-text)]">{day.dayLabel}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {(day.totalMinutes / 60).toFixed(1)}h
                  </span>
                </div>

                <div className="space-y-2">
                  {day.blocks.map((block) => {
                    const isChecked = completedBlocks.has(block.id);
                    return (
                      <div
                        key={block.id}
                        onClick={() => toggleBlockCompleted(block.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all space-y-1 ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--color-text-muted)] line-through'
                            : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button type="button" className="mt-0.5 shrink-0 text-[var(--color-accent)]">
                            {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                          </button>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase block">
                              {block.unitTitle}
                            </span>
                            <span className="font-semibold block leading-tight">{block.topic}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="p-6 space-y-4">
          <div className="space-y-3">
            {plan.days.map((day) => (
              <div key={day.dayNumber} className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold text-[var(--color-text)]">{day.dayLabel}</span>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {(day.totalMinutes / 60).toFixed(1)} Hours Total
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {day.blocks.map((block) => {
                    const isChecked = completedBlocks.has(block.id);
                    return (
                      <div
                        key={block.id}
                        onClick={() => toggleBlockCompleted(block.id)}
                        className={`p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isChecked ? 'line-through text-[var(--color-text-muted)] bg-emerald-500/5' : 'text-[var(--color-text)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button type="button" className="shrink-0 text-[var(--color-accent)]">
                            {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                          </button>
                          <div className="space-y-0.5">
                            <span className="font-bold block">{block.topic}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {block.unitTitle}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--color-text-muted)] shrink-0">
                          {block.minutes} mins
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
