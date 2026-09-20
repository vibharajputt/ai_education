import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import { StateShell } from '@components/StateShell';
import { SplitPane } from '@components/SplitPane';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Badge } from '@components/Badge';
import { SplitViewToolbar } from './components/SplitViewToolbar';
import { AnswerCoachPanel } from './components/AnswerCoachPanel';
import { LiveAssistPanel } from './components/LiveAssistPanel';
import { SiblingDrawer } from './components/SiblingDrawer';
import { JumpToSheet } from './components/JumpToSheet';
import { AnswerCoachData } from './types';
import { ChevronLeft, ChevronRight, BookOpen, Layers, Eye, EyeOff, Sparkles } from 'lucide-react';

export function SplitViewModule() {
  const { collection, items, loading, error, reload } = useCollection('split-view-paper.json');

  // State Management
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSolutionPane, setShowSolutionPane] = useState<boolean>(true);
  const [showJumpSheet, setShowJumpSheet] = useState<boolean>(false);
  const [activeSiblingItem, setActiveSiblingItem] = useState<ContentItem | null>(null);

  // LocalStorage Persisted Preferences
  const [scrollSync, setScrollSync] = useState<boolean>(() => {
    return localStorage.getItem('splitview_scroll_sync') !== 'false';
  });

  const [dividerRatio, setDividerRatio] = useState<number>(() => {
    const saved = localStorage.getItem('splitview_divider_ratio');
    return saved ? parseFloat(saved) : 0.5;
  });

  // Refs for scrolling and focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.body.toLowerCase().includes(q) ||
        (item.chapter && item.chapter.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const focusedItem = filteredItems[focusedIndex] || filteredItems[0] || null;

  // Persist preferences
  const handleToggleScrollSync = () => {
    setScrollSync((prev) => {
      const next = !prev;
      localStorage.setItem('splitview_scroll_sync', String(next));
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // KEYBOARD SHORTCUTS (J / K / S / F)
  // ---------------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing inside input elements
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'j') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (key === 'k') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (key === 's') {
        e.preventDefault();
        setShowSolutionPane((prev) => !prev);
      } else if (key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    },
    [filteredItems.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Sync scroll positions when focused index changes
  useEffect(() => {
    if (scrollSync && leftPaneRef.current && rightPaneRef.current) {
      const el = document.getElementById(`question-card-${focusedItem?.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      rightPaneRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [focusedIndex, focusedItem, scrollSync]);

  // Derived Answer Coach Data for focused item
  const coachData: AnswerCoachData | null = useMemo(() => {
    if (!focusedItem) return null;

    const qMarks = (focusedItem as any).marks || 3;
    return {
      markingBreakdown: [
        { criterion: `Stating fundamental definitions and principles of ${focusedItem.chapter || 'topic'}`, marks: 1 },
        { criterion: 'Writing exact mathematical formula or equation with symbols', marks: Math.max(1, qMarks - 2) },
        { criterion: 'Calculating final numerical value with correct SI units and sign', marks: 1 },
      ],
      requiredKeywords: (focusedItem as any).requiredKeywords || [focusedItem.chapter || 'Physics', 'formula', 'SI unit', 'magnitude'],
      diagramNote: (focusedItem as any).diagramNote || 'Ray diagram / circuit diagram optional but recommended for full presentation marks.',
      commonMistakes: [
        'Omitting SI units in final statement leads to 0.5 mark deduction.',
        'Calculation error in step 2.',
      ],
      examinerNote: 'CBSE examiners look for key terms in bold/underlined. Clear step-by-step presentation earns full marks even if final step has minor calculation error.',
    };
  }, [focusedItem]);

  const status = loading ? 'loading' : error ? 'error' : filteredItems.length === 0 ? 'empty' : 'success';

  // Render Question Paper Left Pane (Clean Typography, No PDF Embed)
  const renderQuestionPaperPane = () => (
    <div ref={leftPaneRef} className="p-4 space-y-4 bg-[var(--color-bg)] h-full overflow-y-auto">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-semibold border-b border-[var(--color-border)] pb-2">
        <span>Question Paper Pane (Use J/K keys to navigate)</span>
        <span>{filteredItems.length} Board Questions</span>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item, idx) => {
          const isFocused = idx === focusedIndex;
          const qYear = (item as any).year || 2022;
          const qMarks = (item as any).marks || 3;
          const repeatCount = (item as any).metadata?.repeatCount || 4;

          return (
            <div
              key={item.id}
              id={`question-card-${item.id}`}
              onClick={() => setFocusedIndex(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isFocused
                  ? 'bg-[var(--color-surface)] border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-md'
                  : 'bg-[var(--color-surface)]/60 border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
              }`}
            >
              {/* Question Header & Marks */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--color-accent)] text-white text-xs font-black">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    {qYear} CBSE
                  </span>
                  {item.difficulty && (
                    <Badge label={item.difficulty} variant="difficulty" />
                  )}
                </div>

                {/* Always Visible Marks & Repeat Badge */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSiblingItem(item);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3" /> Appeared in {repeatCount} yrs
                  </button>

                  <span className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-extrabold text-[var(--color-text)]">
                    {qMarks} Marks
                  </span>
                </div>
              </div>

              {/* Question Typography Body */}
              <p className="text-sm font-medium text-[var(--color-text)] leading-relaxed">
                {item.body}
              </p>

              {item.latex && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-mono">
                  {item.latex}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Right Explanation & Answer Coach Pane
  const renderExplanationPane = () => {
    if (!focusedItem) return null;

    return (
      <div ref={rightPaneRef} className="p-4 space-y-4 bg-[var(--color-surface-subtle)]/40 h-full overflow-y-auto">
        {/* Solution Header Controls */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Verified Solution & Marking Scheme (Q{focusedIndex + 1})</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSolutionPane((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            {showSolutionPane ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSolutionPane ? 'Hide Solution' : 'Show Solution'}</span>
          </button>
        </div>

        {showSolutionPane ? (
          <div className="space-y-4">
            {/* Answer Coach Panel (Always Visible for Tier A items) */}
            {coachData && (
              <AnswerCoachPanel
                coachData={coachData}
                totalMarks={(focusedItem as any).marks || 3}
              />
            )}

            {/* Model Solution & Steps */}
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3 shadow-sm">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                Model Answer & Step-by-Step Working
              </h4>
              <div className="text-xs font-medium text-[var(--color-text)] leading-relaxed">
                <MarkdownRenderer content={focusedItem.body} />
              </div>
            </div>

            {/* Integrated Live Assist Client Panel */}
            <LiveAssistPanel key={focusedItem.id} itemId={focusedItem.id} />
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl space-y-2">
            <EyeOff className="w-8 h-8 text-[var(--color-text-muted)] mx-auto" />
            <h3 className="text-sm font-bold text-[var(--color-text)]">Solution Hidden</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] border text-[10px] font-mono">S</kbd> to reveal verified answer.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-3 sm:px-4 py-4 h-[calc(100vh-2rem)] flex flex-col">
      {/* Top Toolbar */}
      <SplitViewToolbar
        scopeLabel={collection?.scopeLabel || '40 Questions across Class 10 STEM — CBSE Board Paper'}
        scrollSync={scrollSync}
        onToggleScrollSync={handleToggleScrollSync}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenJumpSheet={() => setShowJumpSheet(true)}
        focusedIndex={focusedIndex}
        totalCount={filteredItems.length}
        searchInputRef={searchInputRef}
      />

      {/* Main Split View Area */}
      <StateShell
        status={status}
        error={error}
        onRetry={reload}
        emptyTitle="No matching questions"
        emptyDescription="Try clearing your search query."
      >
        <div className="flex-1 min-h-0 rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)] shadow-sm">
          {/* Desktop Layout (>= 1024px): Resizable SplitPane */}
          <div className="hidden lg:block h-full">
            <SplitPane
              left={renderQuestionPaperPane()}
              right={renderExplanationPane()}
              initialRatio={dividerRatio}
              minRatio={0.3}
              maxRatio={0.7}
            />
          </div>

          {/* Tablet & Mobile Layout (< 1024px): Stacked / Single Column */}
          <div className="block lg:hidden h-full overflow-y-auto space-y-4 p-2">
            {renderQuestionPaperPane()}
            {renderExplanationPane()}
          </div>
        </div>
      </StateShell>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <div className="flex md:hidden items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
        <button
          type="button"
          disabled={focusedIndex === 0}
          onClick={() => setFocusedIndex((prev) => Math.max(prev - 1, 0))}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] disabled:opacity-40 text-xs font-bold text-[var(--color-text)] flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Prev Q
        </button>

        <button
          type="button"
          onClick={() => setShowJumpSheet(true)}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-extrabold"
        >
          Q{focusedIndex + 1} of {filteredItems.length}
        </button>

        <button
          type="button"
          disabled={focusedIndex === filteredItems.length - 1}
          onClick={() => setFocusedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] disabled:opacity-40 text-xs font-bold text-[var(--color-text)] flex items-center gap-1"
        >
          Next Q <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Jump-To Sheet */}
      <JumpToSheet
        isOpen={showJumpSheet}
        onClose={() => setShowJumpSheet(false)}
        items={filteredItems}
        focusedIndex={focusedIndex}
        onSelectIndex={setFocusedIndex}
      />

      {/* Sibling Questions Drawer */}
      <SiblingDrawer
        isOpen={Boolean(activeSiblingItem)}
        onClose={() => setActiveSiblingItem(null)}
        item={activeSiblingItem}
        siblingYears={(activeSiblingItem as any)?.metadata?.siblingYears || [2016, 2018, 2020, 2022]}
        onSelectSibling={(year) => {
          const idx = filteredItems.findIndex((i) => (i as any).year === year);
          if (idx !== -1) setFocusedIndex(idx);
        }}
      />
    </div>
  );
}
