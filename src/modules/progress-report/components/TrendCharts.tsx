// src/modules/progress-report/components/TrendCharts.tsx
import React from 'react';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';

interface TrendChartsProps {
  accuracyTrend: Array<{ index: number; label: string; accuracy: number; count: number }>;
  timeTrend: Array<{ index: number; label: string; avgTimeSec: number }>;
}

export function TrendCharts({ accuracyTrend, timeTrend }: TrendChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Accuracy Trajectory */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm sm:text-base text-[var(--color-text)]">
              Accuracy Trajectory (5-Q Batches)
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            Target: 80%+
          </span>
        </div>

        {accuracyTrend.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-muted)] italic">
            Complete at least 5 questions to view accuracy trends.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="h-40 flex items-end gap-2 sm:gap-3 pt-4 pb-2 px-2 border-b border-[var(--color-border)]">
              {accuracyTrend.map((b) => {
                const heightPct = Math.max(8, b.accuracy);
                return (
                  <div key={b.index} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                      {b.label}: {b.accuracy}%
                    </div>
                    <div className="w-full bg-[var(--color-surface-hover)] rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full transition-all duration-300 rounded-t-md ${
                          b.accuracy >= 80
                            ? 'bg-emerald-500'
                            : b.accuracy >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono truncate w-full text-center">
                      B{b.index}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>Earlier Sessions</span>
              <span>Latest Attempts</span>
            </div>
          </div>
        )}
      </div>

      {/* Time-Per-Question Velocity */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm sm:text-base text-[var(--color-text)]">
              Velocity Trend (Seconds / Question)
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            Benchmark: 45s
          </span>
        </div>

        {timeTrend.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-muted)] italic">
            Complete at least 5 questions to view speed trends.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="h-40 flex items-end gap-2 sm:gap-3 pt-4 pb-2 px-2 border-b border-[var(--color-border)]">
              {timeTrend.map((t) => {
                // benchmark: max 120s
                const maxBenchmark = 120;
                const heightPct = Math.min(100, Math.max(10, (t.avgTimeSec / maxBenchmark) * 100));
                return (
                  <div key={t.index} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                      {t.label}: {t.avgTimeSec}s
                    </div>
                    <div className="w-full bg-[var(--color-surface-hover)] rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-blue-500 transition-all duration-300 rounded-t-md"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono truncate w-full text-center">
                      B{t.index}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>Earlier Sessions</span>
              <span>Latest Velocity</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
