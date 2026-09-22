import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ContentItem } from '@core/types';
import { getItemYear, getItemMarks } from '../types';
import { Card } from '@components/Card';
import { ContentItemCard } from '@components/ContentItemCard';
import {
  Search,
  Flame,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface QuestionBrowserProps {
  items: ContentItem[];
  chapters: { name: string; subject: string }[];
  onSelectQuestion: (item: ContentItem) => void;
}

const ITEMS_PER_PAGE = 20;

export function QuestionBrowser({
  items,
  chapters,
  onSelectQuestion,
}: QuestionBrowserProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const selectedSubject = searchParams.get('subject') || 'all';
  const selectedChapter = searchParams.get('chapter') || 'all';
  const selectedYear = searchParams.get('year') || 'all';
  const selectedDifficulty = searchParams.get('difficulty') || 'all';
  const selectedMarks = searchParams.get('marks') || 'all';
  const selectedType = searchParams.get('type') || 'all';
  const mostRepeatedOnly = searchParams.get('mostRepeated') === 'true';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const updateParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === 'all' || value === '' || value === 'false') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      if (key !== 'page') {
        next.delete('page');
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('tab')) next.set('tab', prev.get('tab')!);
      return next;
    });
  };

  const availableChapters = useMemo(() => {
    if (selectedSubject === 'all') return chapters;
    return chapters.filter((c) => c.subject === selectedSubject);
  }, [chapters, selectedSubject]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedSubject !== 'all' && item.subject !== selectedSubject) return false;
      if (selectedChapter !== 'all' && item.chapter !== selectedChapter) return false;
      const yr = getItemYear(item);
      const mk = getItemMarks(item);
      if (selectedYear !== 'all' && String(yr) !== selectedYear) return false;
      if (selectedDifficulty !== 'all' && item.difficulty !== selectedDifficulty) return false;
      if (selectedMarks !== 'all' && String(mk) !== selectedMarks) return false;
      
      const cog = ((item.metadata || {}) as Record<string, unknown>).cognitiveType;
      if (selectedType !== 'all' && cog !== selectedType) return false;

      if (mostRepeatedOnly) {
        const repScore = ((item.metadata || {}) as Record<string, unknown>).repeatedScore as number;
        if (!repScore || repScore < 5) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inBody = item.body.toLowerCase().includes(q);
        const inConcepts = item.concepts?.some((c) => c.toLowerCase().includes(q));
        const inChapter = item.chapter?.toLowerCase().includes(q);
        if (!inBody && !inConcepts && !inChapter) return false;
      }

      return true;
    });
  }, [
    items,
    selectedSubject,
    selectedChapter,
    selectedYear,
    selectedDifficulty,
    selectedMarks,
    selectedType,
    mostRepeatedOnly,
    searchQuery,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search in 812 PYQs, chemical formulas, theorems, concepts..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={mostRepeatedOnly}
              onChange={(e) => updateParam('mostRepeated', e.target.checked ? 'true' : null)}
              className="rounded text-[var(--color-accent)] focus:ring-0"
            />
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Most Repeated Only
          </label>

          {(searchQuery || selectedSubject !== 'all' || selectedChapter !== 'all' || selectedYear !== 'all' || selectedDifficulty !== 'all' || selectedMarks !== 'all' || selectedType !== 'all' || mostRepeatedOnly) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-[var(--color-border)] text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                updateParam('subject', e.target.value);
                updateParam('chapter', 'all');
              }}
              className="w-full p-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <option value="all">All Subjects</option>
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Chapter</label>
            <select
              value={selectedChapter}
              onChange={(e) => updateParam('chapter', e.target.value)}
              className="w-full p-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] truncate"
            >
              <option value="all">All Chapters</option>
              {availableChapters.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => updateParam('year', e.target.value)}
              className="w-full p-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <option value="all">All Years (2015-2024)</option>
              {['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => updateParam('difficulty', e.target.value)}
              className="w-full p-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Marks</label>
            <select
              value={selectedMarks}
              onChange={(e) => updateParam('marks', e.target.value)}
              className="w-full p-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <option value="all">All Marks</option>
              <option value="1">1 Mark</option>
              <option value="2">2 Marks</option>
              <option value="3">3 Marks</option>
              <option value="4">4 Marks</option>
              <option value="5">5 Marks</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Question Type</label>
            <select
              value={selectedType}
              onChange={(e) => updateParam('type', e.target.value)}
              className="w-full p-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] capitalize"
            >
              <option value="all">All Types</option>
              <option value="conceptual">Conceptual</option>
              <option value="numerical">Numerical</option>
              <option value="diagram">Diagram</option>
              <option value="application">Application</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-muted)] px-1">
        <span>
          Showing <strong className="text-[var(--color-text)]">{filteredItems.length}</strong> of {items.length} questions
        </span>
        {totalPages > 1 && (
          <span>
            Page <strong className="text-[var(--color-text)]">{currentPage}</strong> of {totalPages}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedItems.map((item) => (
          <ContentItemCard
            key={item.id}
            item={item}
            onClick={() => onSelectQuestion(item)}
            className="cursor-pointer hover:border-[var(--color-accent)] transition-all"
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => updateParam('page', String(currentPage - 1))}
            className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)]">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => updateParam('page', String(currentPage + 1))}
            className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
