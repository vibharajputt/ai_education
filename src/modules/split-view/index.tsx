import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import { StateShell } from '@components/StateShell';
import { SplitPane } from '@components/SplitPane';
import { Drawer } from '@components/Drawer';
import { PaperPane } from './components/PaperPane';
import { SolutionPane } from './components/SolutionPane';
import { SiblingQuestionsDrawer } from './components/SiblingQuestionsDrawer';
import { QuestionJumpSheet } from './components/QuestionJumpSheet';
import { KeyboardShortcutHelper } from './components/KeyboardShortcutHelper';
import { getVerifiedExplanation } from './services/explanationStore';
import {
  Columns,
  Layers,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Eye,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const LS_DIVIDER_RATIO = 'split_view_divider_ratio';
const LS_SCROLL_SYNC = 'split_view_scroll_sync';

export function SplitViewModule() {
  const { items: allItems, loading, error, reload } = useCollection('pyq/class10.json');

  // Limit default paper to exactly 40 standard exam questions
  const paperItems = useMemo(() => {
    return allItems.slice(0, 40);
  }, [allItems]);

  // Persistent divider ratio & scroll sync from localStorage
  const [dividerRatio, setDividerRatio] = useState<number>(() => {
    const saved = localStorage.getItem(LS_DIVIDER_RATIO);
    return saved ? parseFloat(saved) : 0.5;
  });

  const [scrollSync, setScrollSync] = useState<boolean>(() => {
    const saved = localStorage.getItem(LS_SCROLL_SYNC);
    return saved === 'true';
  });

  const [activeQuestionId, setActiveQuestionId] = useState<string>('');
  const [siblingDrawerItem, setSiblingDrawerItem] = useState<ContentItem | null>(null);
  const [isMobileJumpOpen, setIsMobileJumpOpen] = useState(false);
  const [isSolutionDrawerOpen, setIsSolutionDrawerOpen] = useState(false);
  const [highlightKeywords, setHighlightKeywords] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set initial active question when data loads
  useEffect(() => {
    if (paperItems.length > 0 && (!activeQuestionId || !paperItems.some((i) => i.id === activeQuestionId))) {
      setActiveQuestionId(paperItems[0].id);
    }
  }, [paperItems, activeQuestionId]);

  // Persist divider ratio
  const handleRatioChange = useCallback((ratio: number) => {
    setDividerRatio(ratio);
    localStorage.setItem(LS_DIVIDER_RATIO, String(ratio));
  }, []);

  // Persist scroll sync
  const handleToggleScrollSync = () => {
    setScrollSync((prev) => {
      const next = !prev;
      localStorage.setItem(LS_SCROLL_SYNC, String(next));
      return next;
    });
  };

  const activeIndex = paperItems.findIndex((it) => it.id === activeQuestionId);
  const currentItem = activeIndex >= 0 ? paperItems[activeIndex] : paperItems[0] || null;

  // Memoized verified explanation for current item
  const currentExplanation = useMemo(() => {
    if (!currentItem) return null;
    return getVerifiedExplanation(currentItem, allItems);
  }, [currentItem, allItems]);

  // Question navigation handlers
  const handleNextQuestion = useCallback(() => {
    if (activeIndex < paperItems.length - 1) {
      const nextId = paperItems[activeIndex + 1].id;
      setActiveQuestionId(nextId);
      if (scrollSync) {
        document.getElementById(`paper-question-${nextId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex, paperItems, scrollSync]);

  const handlePrevQuestion = useCallback(() => {
    if (activeIndex > 0) {
      const prevId = paperItems[activeIndex - 1].id;
      setActiveQuestionId(prevId);
      if (scrollSync) {
        document.getElementById(`paper-question-${prevId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex, paperItems, scrollSync]);

  // Global keyboard shortcuts (J/K navigation, S solution toggle, F focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handlePrevQuestion();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsSolutionDrawerOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextQuestion, handlePrevQuestion]);

  const status = loading ? 'loading' : error ? 'error' : paperItems.length === 0 ? 'empty' : 'success';

  return (
    <StateShell
      status={status}
      error={error}
      onRetry={reload}
      emptyTitle="No Exam Questions Found"
      emptyDescription="The exam paper repository is currently empty."
    >
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
        {/* Top Control Bar */}
        <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <Columns className="w-4 h-4 text-[var(--color-accent)]" />
              Split Exam Paper (40 Questions)
            </span>
            <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">
              • Focused: <strong className="text-[var(--color-text)]">Q{activeIndex + 1}</strong> of {paperItems.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <KeyboardShortcutHelper />

            {/* Scroll Sync Toggle */}
            <button
              type="button"
              onClick={handleToggleScrollSync}
              className={
                'hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ' +
                (scrollSync
                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-bold'
                  : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)]')
              }
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scrollSync ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              Scroll Sync: {scrollSync ? 'ON' : 'OFF'}
            </button>

            {/* Mobile / Tablet Quick Actions */}
            <button
              type="button"
              onClick={() => setIsMobileJumpOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
              title="Jump to Question"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsSolutionDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold"
            >
              <Eye className="w-3.5 h-3.5" />
              Solution
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 relative">
          {/* Desktop Split View (>=1024px) */}
          <div className="hidden lg:block h-full">
            <SplitPane
              ratio={dividerRatio}
              onRatioChange={handleRatioChange}
              left={
                <PaperPane
                  items={paperItems}
                  activeItemId={activeQuestionId}
                  onSelectItem={(id) => setActiveQuestionId(id)}
                  onOpenSiblings={(item) => setSiblingDrawerItem(item)}
                  searchRef={searchInputRef}
                />
              }
              right={
                <SolutionPane
                  item={currentItem}
                  explanation={currentExplanation}
                  highlightKeywords={highlightKeywords}
                  onToggleHighlightKeywords={() => setHighlightKeywords(!highlightKeywords)}
                  questionNumber={activeIndex + 1}
                />
              }
            />
          </div>

          {/* Mobile & Tablet (<1024px) Single Column View */}
          <div className="lg:hidden h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <PaperPane
                items={paperItems}
                activeItemId={activeQuestionId}
                onSelectItem={(id) => {
                  setActiveQuestionId(id);
                  setIsSolutionDrawerOpen(true);
                }}
                onOpenSiblings={(item) => setSiblingDrawerItem(item)}
                searchRef={searchInputRef}
              />
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                disabled={activeIndex <= 0}
                onClick={handlePrevQuestion}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-bold disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <button
                type="button"
                onClick={() => setIsMobileJumpOpen(true)}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)]"
              >
                Q{activeIndex + 1} / {paperItems.length}
              </button>

              <button
                type="button"
                disabled={activeIndex >= paperItems.length - 1}
                onClick={handleNextQuestion}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-bold disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sibling Recurring Questions Side Drawer */}
      <SiblingQuestionsDrawer
        item={siblingDrawerItem}
        onClose={() => setSiblingDrawerItem(null)}
        allQuestions={allItems}
        onSelectSibling={(sib) => {
          setActiveQuestionId(sib.id);
          setSiblingDrawerItem(null);
        }}
      />

      {/* Mobile Solution Drawer (<1024px) */}
      <Drawer
        isOpen={isSolutionDrawerOpen}
        onClose={() => setIsSolutionDrawerOpen(false)}
        title={`Question ${activeIndex + 1} Breakdown`}
      >
        <div className="pb-8">
          <SolutionPane
            item={currentItem}
            explanation={currentExplanation}
            highlightKeywords={highlightKeywords}
            onToggleHighlightKeywords={() => setHighlightKeywords(!highlightKeywords)}
            questionNumber={activeIndex + 1}
          />
        </div>
      </Drawer>

      {/* Mobile Question Quick Jump Bottom Sheet */}
      <QuestionJumpSheet
        isOpen={isMobileJumpOpen}
        onClose={() => setIsMobileJumpOpen(false)}
        items={paperItems}
        activeItemId={activeQuestionId}
        onSelectItem={(id) => setActiveQuestionId(id)}
      />
    </StateShell>
  );
}
