import React, { useState, useMemo, useEffect } from 'react';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import { StateShell } from '@components/StateShell';
import { Tabs } from '@components/Tabs';
import { Drawer } from '@components/Drawer';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Badge } from '@components/Badge';
import { explainItem } from '@core/aiClient';
import { HeatmapView } from './components/HeatmapView';
import { RepeatRankingView } from './components/RepeatRankingView';
import { DifficultyTypeView } from './components/DifficultyTypeView';
import { QuestionBrowserView } from './components/QuestionBrowserView';
import { ChapterHeatmapRow, ConceptRepeatItem, ChapterStats, ViewTab } from './types';
import { BarChart3, Repeat, PieChart, Search, Sparkles, Loader2 } from 'lucide-react';

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

function getItemFields(item: ContentItem) {
  const q = item as any;
  return {
    year: (q.year as number) || 2020,
    marks: (q.marks as number) || 1,
    questionType: (q.questionType as string) || 'short',
  };
}

export function PyqAnalyzerModule() {
  const { collection, items, loading, error, reload } = useCollection('pyq-10th.json');

  // URL-backed State Setup
  const [activeTab, setActiveTab] = useState<ViewTab>('heatmap');
  const [selectedChapter, setSelectedChapter] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedMarks, setSelectedMarks] = useState<string>('All');
  const [mostRepeatedOnly, setMostRepeatedOnly] = useState<boolean>(false);

  // Active AI Explanation Drawer State
  const [activeExplanation, setActiveExplanation] = useState<{
    item: ContentItem;
    text: string;
    isStreaming: boolean;
  } | null>(null);
  const [explainingId, setExplainingId] = useState<string | null>(null);

  // Sync state from URL parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ViewTab;
    if (tabParam && ['heatmap', 'repeat', 'difficulty', 'browser'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if (params.get('chapter')) setSelectedChapter(params.get('chapter')!);
    if (params.get('year')) setSelectedYear(params.get('year')!);
    if (params.get('difficulty')) setSelectedDifficulty(params.get('difficulty')!);
    if (params.get('type')) setSelectedType(params.get('type')!);
    if (params.get('marks')) setSelectedMarks(params.get('marks')!);
    if (params.get('mostRepeated') === 'true') setMostRepeatedOnly(true);
  }, []);

  // Update URL parameters whenever filter state changes
  const updateUrlParams = (updates: Record<string, string | boolean | undefined>) => {
    const url = new URL(window.location.href);
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined || val === 'All' || val === false) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, String(val));
      }
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    if (key === 'chapter') setSelectedChapter(value as string);
    if (key === 'year') setSelectedYear(value as string);
    if (key === 'difficulty') setSelectedDifficulty(value as string);
    if (key === 'type') setSelectedType(value as string);
    if (key === 'marks') setSelectedMarks(value as string);
    if (key === 'mostRepeated') setMostRepeatedOnly(value as boolean);

    updateUrlParams({ [key]: value });
  };

  const handleResetFilters = () => {
    setSelectedChapter('All');
    setSelectedYear('All');
    setSelectedDifficulty('All');
    setSelectedType('All');
    setSelectedMarks('All');
    setMostRepeatedOnly(false);
    updateUrlParams({
      chapter: undefined,
      year: undefined,
      difficulty: undefined,
      type: undefined,
      marks: undefined,
      mostRepeated: undefined,
    });
  };

  const handleCellClick = (chapter: string, year: number) => {
    setSelectedChapter(chapter);
    setSelectedYear(String(year));
    setActiveTab('browser');
    updateUrlParams({
      tab: 'browser',
      chapter,
      year: String(year),
    });
  };

  // ---------------------------------------------------------------------------
  // MEMOISED HEAVY AGGREGATIONS (Computed ONCE on load, zero re-render lag)
  // ---------------------------------------------------------------------------

  // 1. Heatmap Rows Aggregation
  const heatmapRows = useMemo<ChapterHeatmapRow[]>(() => {
    if (items.length === 0) return [];

    const map = new Map<string, { subject: string; yearMarks: Record<number, number>; yearCounts: Record<number, number> }>();

    for (const item of items) {
      const ch = item.chapter || 'General';
      const fields = getItemFields(item);
      const yr = fields.year;
      const m = fields.marks;

      if (!map.has(ch)) {
        const yearMarks: Record<number, number> = {};
        const yearCounts: Record<number, number> = {};
        for (const y of YEARS) {
          yearMarks[y] = 0;
          yearCounts[y] = 0;
        }
        map.set(ch, { subject: item.subject || 'Science', yearMarks, yearCounts });
      }

      const row = map.get(ch)!;
      row.yearMarks[yr] = (row.yearMarks[yr] || 0) + m;
      row.yearCounts[yr] = (row.yearCounts[yr] || 0) + 1;
    }

    const result: ChapterHeatmapRow[] = [];
    for (const [ch, data] of map.entries()) {
      let totalMarks = 0;
      let totalCount = 0;
      let first5Marks = 0;
      let last5Marks = 0;

      for (const y of YEARS) {
        const m = data.yearMarks[y] || 0;
        const c = data.yearCounts[y] || 0;
        totalMarks += m;
        totalCount += c;

        if (y <= 2019) first5Marks += m;
        else last5Marks += m;
      }

      const firstAvg = first5Marks / 5;
      const lastAvg = last5Marks / 5;
      const ratio = firstAvg === 0 ? 2.0 : lastAvg / firstAvg;

      let trend: 'up' | 'flat' | 'down' = 'flat';
      if (ratio >= 1.15) trend = 'up';
      else if (ratio <= 0.85) trend = 'down';

      result.push({
        chapter: ch,
        subject: data.subject,
        yearMarks: data.yearMarks,
        yearCounts: data.yearCounts,
        totalMarks,
        totalCount,
        trend,
        trendRatio: ratio,
      });
    }

    return result.sort((a, b) => b.totalMarks - a.totalMarks);
  }, [items]);

  // 2. Concept Repeat Aggregation
  const conceptRepeats = useMemo<ConceptRepeatItem[]>(() => {
    if (items.length === 0) return [];

    const map = new Map<string, { subject: string; chapter: string; years: Set<number>; marks: number; siblings: ContentItem[] }>();

    for (const item of items) {
      const fields = getItemFields(item);
      for (const concept of item.concepts) {
        if (!concept) continue;
        if (!map.has(concept)) {
          map.set(concept, {
            subject: item.subject || 'Science',
            chapter: item.chapter || 'General',
            years: new Set<number>(),
            marks: 0,
            siblings: [],
          });
        }
        const data = map.get(concept)!;
        if (fields.year) data.years.add(fields.year);
        data.marks += fields.marks;
        data.siblings.push(item);
      }
    }

    const list: ConceptRepeatItem[] = [];
    for (const [concept, data] of map.entries()) {
      const yearsArr = Array.from(data.years).sort((a, b) => a - b);
      const count = yearsArr.length;
      const avgMarks = Math.round((data.marks / Math.max(1, count)) * 10) / 10;

      list.push({
        concept,
        subject: data.subject,
        chapter: data.chapter,
        yearsAppeared: yearsArr,
        appearanceCount: count,
        totalMarks: data.marks,
        avgMarks,
        repeatScore: (data.siblings[0]?.metadata?.repeatScore as number) || count,
        siblingQuestions: data.siblings,
      });
    }

    return list.sort((a, b) => b.appearanceCount - a.appearanceCount || b.totalMarks - a.totalMarks);
  }, [items]);

  // 3. Difficulty & Type Distribution Aggregation
  const chapterStats = useMemo<ChapterStats[]>(() => {
    if (items.length === 0) return [];

    const map = new Map<string, ChapterStats>();

    for (const item of items) {
      const ch = item.chapter || 'General';
      if (!map.has(ch)) {
        map.set(ch, {
          chapter: ch,
          subject: item.subject || 'Science',
          easyCount: 0,
          mediumCount: 0,
          hardCount: 0,
          conceptualCount: 0,
          numericalCount: 0,
          diagramCount: 0,
          applicationCount: 0,
          totalQuestions: 0,
        });
      }

      const st = map.get(ch)!;
      st.totalQuestions++;

      if (item.difficulty === 'easy') st.easyCount++;
      else if (item.difficulty === 'hard') st.hardCount++;
      else st.mediumCount++;

      const category = (item.metadata?.category as string) || (item.tags.find((t) => ['conceptual', 'numerical', 'diagram', 'application'].includes(t)) || 'conceptual');
      if (category === 'numerical' || item.subject === 'Mathematics') st.numericalCount++;
      else if (category === 'diagram') st.diagramCount++;
      else if (category === 'application') st.applicationCount++;
      else st.conceptualCount++;
    }

    return Array.from(map.values()).sort((a, b) => b.totalQuestions - a.totalQuestions);
  }, [items]);

  // 4. Filtered Question List for Browser View
  const filteredBrowserItems = useMemo(() => {
    return items.filter((item) => {
      const fields = getItemFields(item);
      if (selectedChapter !== 'All' && item.chapter !== selectedChapter) return false;
      if (selectedYear !== 'All' && String(fields.year) !== selectedYear) return false;
      if (selectedDifficulty !== 'All' && item.difficulty !== selectedDifficulty) return false;
      if (selectedType !== 'All' && fields.questionType !== selectedType) return false;
      if (selectedMarks !== 'All' && String(fields.marks) !== selectedMarks) return false;
      if (mostRepeatedOnly && ((item.metadata?.repeatScore as number) || 0) < 4) return false;
      return true;
    });
  }, [items, selectedChapter, selectedYear, selectedDifficulty, selectedType, selectedMarks, mostRepeatedOnly]);

  const uniqueChapters = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.chapter).filter((c): c is string => Boolean(c)))).sort();
  }, [items]);

  // AI Solution Handler
  const handleExplain = async (item: ContentItem) => {
    setExplainingId(item.id);
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
              text: 'Unable to stream solution walkthrough. Please try again.',
              isStreaming: false,
            }
          : null
      );
    } finally {
      setExplainingId(null);
    }
  };

  const status = loading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'success';

  const tabItems = [
    {
      id: 'heatmap',
      label: 'Chapter Heatmap',
      content: (
        <HeatmapView
          rows={heatmapRows}
          years={YEARS}
          onCellClick={handleCellClick}
          selectedChapter={selectedChapter}
          selectedYear={selectedYear !== 'All' ? Number(selectedYear) : undefined}
        />
      ),
    },
    {
      id: 'repeat',
      label: 'Repeat Ranking',
      content: (
        <RepeatRankingView
          concepts={conceptRepeats}
          onSelectQuestion={(id) => {
            const q = items.find((i) => i.id === id);
            if (q) {
              const fields = getItemFields(q);
              setSelectedChapter(q.chapter || 'All');
              setSelectedYear(String(fields.year || 'All'));
              setActiveTab('browser');
            }
          }}
        />
      ),
    },
    {
      id: 'difficulty',
      label: 'Difficulty & Type',
      content: <DifficultyTypeView stats={chapterStats} />,
    },
    {
      id: 'browser',
      label: `Question Browser (${filteredBrowserItems.length})`,
      content: (
        <QuestionBrowserView
          items={filteredBrowserItems}
          chapters={uniqueChapters}
          years={YEARS}
          selectedChapter={selectedChapter}
          selectedYear={selectedYear}
          selectedDifficulty={selectedDifficulty}
          selectedType={selectedType}
          selectedMarks={selectedMarks}
          mostRepeatedOnly={mostRepeatedOnly}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onExplain={handleExplain}
          explainingId={explainingId}
        />
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-3 sm:px-4 py-4">
      {/* Module Header & Scope Label */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[var(--color-accent)]" />
            PYQ Chapter & Concept Heatmap
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">
            10-Year CBSE Board Exam Trend Analysis & Question Bank
          </p>
        </div>

        {/* Prominent Scope Label (AGENTS.md Non-Negotiable Rule) */}
        <div className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-accent)] self-start md:self-center">
          {collection?.scopeLabel || 'Class 10 Science + Maths, 2015-2024, 812 questions'}
        </div>
      </div>

      {/* StateShell Container */}
      <StateShell
        status={status}
        error={error}
        onRetry={reload}
        emptyTitle="No PYQ data available"
        emptyDescription="Failed to load 10-year past paper data."
      >
        <div className="pt-2">
          {!loading && !error && (
            <Tabs
              tabs={tabItems}
              defaultTab={activeTab}
            />
          )}
        </div>
      </StateShell>

      {/* AI Walkthrough Drawer */}
      <Drawer
        isOpen={Boolean(activeExplanation)}
        onClose={() => setActiveExplanation(null)}
        title="AI Solution & Marking Scheme"
      >
        {activeExplanation && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center gap-2">
                <Badge label={activeExplanation.item.kind} variant="kind" />
                {activeExplanation.item.difficulty && (
                  <Badge label={activeExplanation.item.difficulty} variant="difficulty" />
                )}
                {getItemFields(activeExplanation.item).year && (
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                    {getItemFields(activeExplanation.item).year} CBSE Board
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text)] font-medium">
                {activeExplanation.item.body}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Solution Walkthrough
                </h3>
                {activeExplanation.isStreaming && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-accent)] font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Streaming...
                  </span>
                )}
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] min-h-[160px]">
                {activeExplanation.text ? (
                  <MarkdownRenderer content={activeExplanation.text} />
                ) : (
                  <div className="flex items-center justify-center h-28 text-xs text-[var(--color-text-muted)] gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating solution...
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
