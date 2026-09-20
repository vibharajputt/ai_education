import React from 'react';
import { ContentItem } from '@core/types';
import { ContentItemCard } from '@components/ContentItemCard';
import { Filter, RotateCcw } from 'lucide-react';

interface QuestionBrowserViewProps {
  items: ContentItem[];
  chapters: string[];
  years: number[];
  selectedChapter: string;
  selectedYear: string;
  selectedDifficulty: string;
  selectedType: string;
  selectedMarks: string;
  mostRepeatedOnly: boolean;
  onFilterChange: (key: string, value: string | boolean) => void;
  onResetFilters: () => void;
  onExplain?: (item: ContentItem) => void;
  explainingId?: string | null;
}

export const QuestionBrowserView: React.FC<QuestionBrowserViewProps> = ({
  items,
  chapters,
  years,
  selectedChapter,
  selectedYear,
  selectedDifficulty,
  selectedType,
  selectedMarks,
  mostRepeatedOnly,
  onFilterChange,
  onResetFilters,
  onExplain,
  explainingId,
}) => {
  return (
    <div className="space-y-4">
      {/* Filters Control Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            Browser Filter Criteria
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[var(--color-accent)] hover:underline font-semibold text-[11px]"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Chapter Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase mb-1">
              Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => onFilterChange('chapter', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            >
              <option value="All">All Chapters</option>
              {chapters.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => onFilterChange('year', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            >
              <option value="All">All Years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => onFilterChange('difficulty', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            >
              <option value="All">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase mb-1">
              Question Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            >
              <option value="All">All Types</option>
              <option value="mcq">MCQ (1m)</option>
              <option value="short">Short (3m)</option>
              <option value="long">Long (5m)</option>
              <option value="assertion-reason">Assertion-Reason</option>
            </select>
          </div>

          {/* Marks Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase mb-1">
              Marks
            </label>
            <select
              value={selectedMarks}
              onChange={(e) => onFilterChange('marks', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            >
              <option value="All">All Marks</option>
              <option value="1">1 Mark</option>
              <option value="2">2 Marks</option>
              <option value="3">3 Marks</option>
              <option value="5">5 Marks</option>
            </select>
          </div>

          {/* Most Repeated Toggle */}
          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center gap-2 cursor-pointer p-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-semibold select-none">
              <input
                type="checkbox"
                checked={mostRepeatedOnly}
                onChange={(e) => onFilterChange('mostRepeated', e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-0"
              />
              <span>Most Repeated Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Counter & Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium px-1">
          <span>Showing {items.length} matching board questions</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              onExplain={onExplain}
              isExplaining={explainingId === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
