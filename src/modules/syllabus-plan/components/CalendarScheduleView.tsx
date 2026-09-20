import React from 'react';
import type { StudyPlanDay } from '../types';
import { Clock, CheckCircle2, Circle } from 'lucide-react';

interface CalendarScheduleViewProps {
  days: StudyPlanDay[];
  onToggleBlock: (blockId: string) => void;
}

export function CalendarScheduleView({ days, onToggleBlock }: CalendarScheduleViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => {
          const completedCount = day.blocks.filter((b) => b.completed).length;
          const isAllDone = day.blocks.length > 0 && completedCount === day.blocks.length;

          return (
            <div
              key={day.date}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isAllDone
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-accent)] font-bold text-xs">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {day.totalMinutes}m
                  </span>
                </div>

                <div className="space-y-2">
                  {day.blocks.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => onToggleBlock(b.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        b.completed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                      >
                        {b.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-[var(--color-text-muted)]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className={`font-bold truncate ${b.completed ? 'line-through opacity-70' : ''}`}>
                          {b.topic}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between mt-0.5">
                          <span>{b.activity}</span>
                          <span className="font-mono">{b.minutes}m</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span>{completedCount} / {day.blocks.length} Completed</span>
                {isAllDone && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Day Complete
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
