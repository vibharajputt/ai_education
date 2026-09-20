import React from 'react';
import type { StudyPlanDay } from '../types';
import { CheckCircle2, Circle, Clock, CheckSquare } from 'lucide-react';

interface ListScheduleViewProps {
  days: StudyPlanDay[];
  onToggleBlock: (blockId: string) => void;
}

export function ListScheduleView({ days, onToggleBlock }: ListScheduleViewProps) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-[var(--color-accent)]" />
          Chronological Task Checklist
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          Checkboxes persist to localStorage across sessions
        </span>
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day.date} className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface-subtle)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <span>
                Day {day.dayNumber} • {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[var(--color-text-muted)] font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {day.totalMinutes} mins
              </span>
            </div>

            <div className="space-y-1.5 pl-2">
              {day.blocks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onToggleBlock(b.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    b.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button type="button" className="text-[var(--color-accent)]">
                      {b.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--color-text-muted)]" />
                      )}
                    </button>
                    <div>
                      <span className={`font-bold ${b.completed ? 'line-through opacity-70' : 'text-[var(--color-text)]'}`}>
                        {b.topic}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)] ml-2">
                        • {b.activity}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                    {b.minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
