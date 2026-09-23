// src/modules/common/ModuleCollectionViewer.tsx
import React, { useState, useMemo } from 'react';
import { useCollection } from '@core/loaders';
import { explainItem } from '@core/aiClient';
import type { ContentItem } from '@core/types';
import { StateShell } from '@components/StateShell';
import { ContentItemCard } from '@components/ContentItemCard';
import { Filters } from '@components/Filters';
import { Drawer } from '@components/Drawer';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Badge } from '@components/Badge';
import { Sparkles, Loader2, Search, SlidersHorizontal, BookOpen, BrainCircuit } from 'lucide-react';

interface ModuleCollectionViewerProps {
  dataSource: string;
  moduleTitle?: string;
}

export function ModuleCollectionViewer({ dataSource, moduleTitle }: ModuleCollectionViewerProps) {
  const { collection, items, loading, error, reload } = useCollection(dataSource);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [activeExplanation, setActiveExplanation] = useState<{
    item: ContentItem;
    text: string;
    isStreaming: boolean;
  } | null>(null);
  const [isExplainingId, setIsExplainingId] = useState<string | null>(null);

  // Derive filter options dynamically from collection or items
  const filterOptions = useMemo(() => {
    if (collection?.filters && Object.keys(collection.filters).length > 0) {
      return Object.entries(collection.filters).map(([key, values]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        values,
      }));
    }

    // Auto-derive from item properties if collection.filters is empty
    const subjects = Array.from(new Set(items.map((i) => i.subject).filter(Boolean))) as string[];
    const difficulties = Array.from(new Set(items.map((i) => i.difficulty).filter(Boolean))) as string[];
    const opts = [];
    if (subjects.length > 1) {
      opts.push({ key: 'subject', label: 'Subject', values: subjects });
    }
    if (difficulties.length > 1) {
      opts.push({ key: 'difficulty', label: 'Difficulty', values: difficulties });
    }
    return opts;
  }, [collection, items]);

  // Filter items by search query and selected facet filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesBody = item.body.toLowerCase().includes(query);
        const matchesSubject = item.subject?.toLowerCase().includes(query);
        const matchesChapter = item.chapter?.toLowerCase().includes(query);
        const matchesConcepts = item.concepts.some((c) => c.toLowerCase().includes(query));
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesBody && !matchesSubject && !matchesChapter && !matchesConcepts && !matchesTags) {
          return false;
        }
      }

      // 2. Facet filters
      for (const [key, selectedValues] of Object.entries(selectedFilters)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        const itemVal = (item as unknown as Record<string, unknown>)[key];
        if (typeof itemVal === 'string') {
          if (!selectedValues.includes(itemVal)) return false;
        }
      }
      return true;
    });
  }, [items, selectedFilters, searchQuery]);

  const handleExplain = async (item: ContentItem) => {
    setIsExplainingId(item.id);
    setActiveExplanation({ item, text: '', isStreaming: true });
    try {
      for await (const chunk of explainItem({
        itemId: item.id,
        itemBody: item.body,
        subject: item.subject,
        chapter: item.chapter,
        track: item.track,
      })) {
        setActiveExplanation((prev) =>
          prev
            ? {
                ...prev,
                text: prev.text + chunk.delta,
                isStreaming: !chunk.done,
              }
            : null
        );
      }
    } catch {
      setActiveExplanation((prev) =>
        prev
          ? {
              ...prev,
              text: 'Unable to stream live explanation at this moment. Please try again.',
              isStreaming: false,
            }
          : null
      );
    } finally {
      setIsExplainingId(null);
    }
  };

  const status = loading
    ? 'loading'
    : error
    ? 'error'
    : filteredItems.length === 0
    ? 'empty'
    : 'success';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Controls: Search and Filters Header */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder={`Search in ${collection?.title ?? moduleTitle ?? 'items'} (topics, formulas, tags)...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Total items counter pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] shrink-0 self-start sm:self-auto shadow-xs">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                <strong className="text-[var(--color-text)] font-extrabold">{filteredItems.length}</strong> of {items.length} items
              </span>
            </div>
          </div>

          {/* Modern Facet Filters Bar */}
          {filterOptions.length > 0 && (
            <Filters
              options={filterOptions}
              selected={selectedFilters}
              onChange={setSelectedFilters}
            />
          )}
        </div>
      )}

      {/* StateShell for Loading, Empty, Error, and Success */}
      <StateShell
        status={status}
        error={error}
        onRetry={reload}
        emptyTitle="No items match your criteria"
        emptyDescription="Try clearing your search term or resetting your filter selections."
        emptyAction={{
          label: 'Reset All Filters',
          onClick: () => {
            setSelectedFilters({});
            setSearchQuery('');
          },
        }}
      >
        <div className="grid grid-cols-1 gap-5">
          {filteredItems.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              onExplain={handleExplain}
              isExplaining={isExplainingId === item.id}
            />
          ))}
        </div>
      </StateShell>

      {/* AI Solution Drawer */}
      <Drawer
        isOpen={Boolean(activeExplanation)}
        onClose={() => setActiveExplanation(null)}
        title="AI Solution & Reasoning Breakdown"
      >
        {activeExplanation && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge label={activeExplanation.item.kind} variant="kind" />
                {activeExplanation.item.difficulty && (
                  <Badge label={activeExplanation.item.difficulty} variant="difficulty" />
                )}
                {activeExplanation.item.subject && (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {activeExplanation.item.subject}
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--color-text)] font-medium leading-relaxed prose prose-sm dark:prose-invert">
                <MarkdownRenderer content={activeExplanation.item.body} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-blue-500" />
                  Google AI Step-by-Step Breakdown
                </h3>
                {activeExplanation.isStreaming && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing...
                  </span>
                )}
              </div>
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] min-h-[200px] shadow-sm">
                {activeExplanation.text ? (
                  <MarkdownRenderer content={activeExplanation.text} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-36 text-xs text-[var(--color-text-muted)] gap-3">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="font-semibold">Synthesizing authoritative step-by-step guidance...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/** Helper factory to create a Lazy Module FC for a given dataSource */
export function createModuleViewer(dataSource: string, moduleTitle?: string) {
  return function LazyViewer() {
    return <ModuleCollectionViewer dataSource={dataSource} moduleTitle={moduleTitle} />;
  };
}
