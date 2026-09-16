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
import { Sparkles, Loader2 } from 'lucide-react';

export function DemoSchoolModule() {
  const { collection, items, loading, error, reload } = useCollection('demo-school.json');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [activeExplanation, setActiveExplanation] = useState<{
    item: ContentItem;
    text: string;
    isStreaming: boolean;
  } | null>(null);
  const [isExplainingId, setIsExplainingId] = useState<string | null>(null);

  // Derive available filter options from collection
  const filterOptions = useMemo(() => {
    if (!collection?.filters) return [];
    return Object.entries(collection.filters).map(([key, values]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      values,
    }));
  }, [collection]);

  // Apply active filters to items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      for (const [key, selectedValues] of Object.entries(selectedFilters)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        const itemVal = (item as unknown as Record<string, unknown>)[key];
        if (typeof itemVal === 'string') {
          if (!selectedValues.includes(itemVal)) return false;
        }
      }
      return true;
    });
  }, [items, selectedFilters]);

  const handleExplain = async (item: ContentItem) => {
    setIsExplainingId(item.id);
    setActiveExplanation({ item, text: '', isStreaming: true });
    try {
      for await (const chunk of explainItem({
        itemId: item.id,
        itemBody: item.body,
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
              text: 'Unable to stream explanation at this time. Please try again.',
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Filter Bar */}
      {filterOptions.length > 0 && !loading && !error && (
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Filters
            options={filterOptions}
            selected={selectedFilters}
            onChange={setSelectedFilters}
          />
        </div>
      )}

      {/* StateShell enforcing Loading, Error, and Empty states */}
      <StateShell
        status={status}
        error={error}
        onRetry={reload}
        emptyTitle="No matching questions"
        emptyDescription="Try clearing or adjusting your filter selections."
        emptyAction={{
          label: 'Reset Filters',
          onClick: () => setSelectedFilters({}),
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium px-1">
            <span>Showing {filteredItems.length} of {items.length} items</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => (
              <ContentItemCard
                key={item.id}
                item={item}
                onExplain={handleExplain}
                isExplaining={isExplainingId === item.id}
              />
            ))}
          </div>
        </div>
      </StateShell>

      {/* Explanation Side Drawer */}
      <Drawer
        isOpen={Boolean(activeExplanation)}
        onClose={() => setActiveExplanation(null)}
        title="AI Solution Walkthrough"
      >
        {activeExplanation && (
          <div className="space-y-6">
            {/* Context Header */}
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center gap-2">
                <Badge label={activeExplanation.item.kind} variant="kind" />
                {activeExplanation.item.difficulty && (
                  <Badge label={activeExplanation.item.difficulty} variant="difficulty" />
                )}
              </div>
              <p className="text-xs text-[var(--color-text)] font-medium line-clamp-2">
                {activeExplanation.item.body}
              </p>
            </div>

            {/* AI Stream Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Explanation Stream
                </h3>
                {activeExplanation.isStreaming && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-accent)] font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating...
                  </span>
                )}
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] min-h-[160px]">
                {activeExplanation.text ? (
                  <MarkdownRenderer content={activeExplanation.text} />
                ) : (
                  <div className="flex items-center justify-center h-28 text-xs text-[var(--color-text-muted)] gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing step-by-step reasoning...
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
