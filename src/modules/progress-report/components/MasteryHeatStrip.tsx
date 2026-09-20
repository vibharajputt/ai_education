// src/modules/progress-report/components/MasteryHeatStrip.tsx
import React, { useState } from 'react';
import type { ConceptMastery } from '@core';
import { Badge } from '@components/Badge';
import { Zap, Filter, Search, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface MasteryHeatStripProps {
  concepts: ConceptMastery[];
}

export function MasteryHeatStrip({ concepts }: MasteryHeatStripProps) {
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning' | 'struggling'>('all');
  const [search, setSearch] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<ConceptMastery | null>(null);

  const filteredConcepts = concepts.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !c.concept.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: ConceptMastery['status']) => {
    switch (status) {
      case 'mastered':
        return 'bg-emerald-500 text-white';
      case 'learning':
        return 'bg-amber-500 text-white';
      case 'struggling':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const getHeatBg = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300';
    if (pct >= 50) return 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300';
    return 'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300';
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="font-bold text-base text-[var(--color-text)]">
              Concept Mastery Heat Strip
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Elo-rated proficiency across all attempted curriculum topics.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--color-bg)] p-1 rounded-lg border border-[var(--color-border)] text-xs">
          {(['all', 'mastered', 'learning', 'struggling'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {f} ({f === 'all' ? concepts.length : concepts.filter((c) => c.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter concept by name..."
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </div>

      {/* Visual Heat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredConcepts.map((c) => {
          const isSelected = selectedConcept?.concept === c.concept;
          return (
            <button
              key={c.concept}
              type="button"
              onClick={() => setSelectedConcept(isSelected ? null : c)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${getHeatBg(
                c.masteryPercent,
              )} ${isSelected ? 'ring-2 ring-[var(--color-accent)] shadow-md' : 'hover:scale-[1.01]'}`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                  <span>{c.rating} Elo</span>
                  <span>{c.masteryPercent}%</span>
                </div>
                <h4 className="text-xs font-bold line-clamp-2 leading-snug">{c.concept}</h4>
              </div>

              <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between text-[10px]">
                <span>{c.attemptsCount} attempts</span>
                <span className="capitalize">{c.status}</span>
              </div>
            </button>
          );
        })}
        {filteredConcepts.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-[var(--color-text-muted)] italic">
            No concepts match the selected filter.
          </div>
        )}
      </div>

      {/* Detail Card if Selected */}
      {selectedConcept && (
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] animate-in fade-in-30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                Selected Concept Focus
              </span>
              <h4 className="font-bold text-sm text-[var(--color-text)]">
                {selectedConcept.concept}
              </h4>
            </div>
            <Badge
              variant={
                selectedConcept.status === 'mastered'
                  ? 'success'
                  : selectedConcept.status === 'learning'
                  ? 'warning'
                  : 'danger'
              }
            >
              {selectedConcept.status} ({selectedConcept.masteryPercent}%)
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">Elo Rating</span>
              <span className="font-bold text-[var(--color-text)]">{selectedConcept.rating}</span>
            </div>
            <div className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">Accuracy</span>
              <span className="font-bold text-[var(--color-text)]">
                {selectedConcept.attemptsCount > 0
                  ? Math.round((selectedConcept.correctCount / selectedConcept.attemptsCount) * 100)
                  : 0}
                % ({selectedConcept.correctCount}/{selectedConcept.attemptsCount})
              </span>
            </div>
            <div className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">FSRS Stability</span>
              <span className="font-bold text-[var(--color-text)]">
                {Math.round(selectedConcept.stability * 10) / 10} days
              </span>
            </div>
            <div className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">Last Practiced</span>
              <span className="font-bold text-[var(--color-text)]">
                {new Date(selectedConcept.lastAttempted).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
