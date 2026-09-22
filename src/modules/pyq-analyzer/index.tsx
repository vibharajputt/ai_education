import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import {
  ChapterHeatmapRow,
  ConceptRanking,
  ChapterDifficultyDist,
  ChapterTypeDist,
  getItemYear,
  getItemMarks,
} from './types';
import { StateShell } from '@components/StateShell';
import { HeatmapView } from './components/HeatmapView';
import { RepeatRankingView } from './components/RepeatRankingView';
import { DifficultyTypeView } from './components/DifficultyTypeView';
import { QuestionBrowser } from './components/QuestionBrowser';
import { QuestionDetailDrawer } from './components/QuestionDetailDrawer';
import {
  Grid,
  Flame,
  BarChart3,
  Search,
} from 'lucide-react';

const ALL_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

export function PyqAnalyzerModule() {
  const { items, loading, error, reload } = useCollection('pyq-analyzer.json');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedQuestion, setSelectedQuestion] = useState<ContentItem | null>(null);

  const activeTab = searchParams.get('tab') || 'heatmap';

  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // 1. Chapter Heatmap Matrix Aggregation (Computed strictly once on load)
  const heatmapMatrix = useMemo<ChapterHeatmapRow[]>(() => {
    if (!items || items.length === 0) return [];

    const map = new Map<string, {
      chapter: string;
      subject: string;
      yearMarks: Record<number, number>;
      yearCounts: Record<number, number>;
      totalMarks: number;
      totalQuestions: number;
    }>();

    for (const item of items) {
      const chapter = item.chapter || 'General';
      const subject = item.subject || 'General';
      const year = getItemYear(item) || 2024;
      const marks = getItemMarks(item) || 1;

      if (!map.has(chapter)) {
        const yearMarks: Record<number, number> = {};
        const yearCounts: Record<number, number> = {};
        for (const y of ALL_YEARS) {
          yearMarks[y] = 0;
          yearCounts[y] = 0;
        }
        map.set(chapter, {
          chapter,
          subject,
          yearMarks,
          yearCounts,
          totalMarks: 0,
          totalQuestions: 0,
        });
      }

      const entry = map.get(chapter)!;
      entry.yearMarks[year] = (entry.yearMarks[year] || 0) + marks;
      entry.yearCounts[year] = (entry.yearCounts[year] || 0) + 1;
      entry.totalMarks += marks;
      entry.totalQuestions += 1;
    }

    return Array.from(map.values()).map((e) => {
      const recentAvg = ((e.yearMarks[2024] || 0) + (e.yearMarks[2023] || 0) + (e.yearMarks[2022] || 0)) / 3;
      const pastAvg = ((e.yearMarks[2021] || 0) + (e.yearMarks[2020] || 0)) / 2;

      let trend: 'up' | 'down' | 'steady' = 'steady';
      if (recentAvg > pastAvg * 1.10) trend = 'up';
      else if (recentAvg < pastAvg * 0.90) trend = 'down';

      return {
        ...e,
        trend,
        avgMarksRecent: recentAvg,
        avgMarksPast: pastAvg,
      };
    });
  }, [items]);

  // 2. Concept Repeat Rankings (Computed once on load)
  const conceptRankings = useMemo<ConceptRanking[]>(() => {
    if (!items || items.length === 0) return [];

    const map = new Map<string, {
      concept: string;
      subject: string;
      chapter: string;
      yearsSet: Set<number>;
      totalMarks: number;
      questions: ContentItem[];
    }>();

    for (const item of items) {
      if (!item.concepts || item.concepts.length === 0) continue;
      const year = getItemYear(item) || 2024;
      const marks = getItemMarks(item) || 1;

      for (const concept of item.concepts) {
        if (!map.has(concept)) {
          map.set(concept, {
            concept,
            subject: item.subject || '',
            chapter: item.chapter || '',
            yearsSet: new Set(),
            totalMarks: 0,
            questions: [],
          });
        }
        const entry = map.get(concept)!;
        entry.yearsSet.add(year);
        entry.totalMarks += marks;
        entry.questions.push(item);
      }
    }

    return Array.from(map.values())
      .map((e) => {
        const appearedYears = Array.from(e.yearsSet).sort((a, b) => b - a);
        const distinctYearsCount = appearedYears.length;
        const totalQuestions = e.questions.length;
        const avgMarks = Math.round((e.totalMarks / totalQuestions) * 10) / 10;
        const repeatScore = (distinctYearsCount / 10) * 50 + totalQuestions * 3 + avgMarks * 2;

        return {
          concept: e.concept,
          subject: e.subject,
          chapter: e.chapter,
          appearedYears,
          distinctYearsCount,
          avgMarks,
          totalQuestions,
          repeatScore,
          questions: e.questions,
        };
      })
      .sort((a, b) => b.repeatScore - a.repeatScore);
  }, [items]);

  // 3. Difficulty and Type Distributions (Computed once on load)
  const { difficultyDist, typeDist } = useMemo(() => {
    if (!items || items.length === 0) return { difficultyDist: [], typeDist: [] };

    const diffMap = new Map<string, { chapter: string; subject: string; easy: number; medium: number; hard: number; total: number }>();
    const typeMap = new Map<string, { chapter: string; subject: string; conceptual: number; numerical: number; diagram: number; application: number; total: number }>();

    for (const item of items) {
      const chapter = item.chapter || 'General';
      const subject = item.subject || 'General';

      if (!diffMap.has(chapter)) {
        diffMap.set(chapter, { chapter, subject, easy: 0, medium: 0, hard: 0, total: 0 });
        typeMap.set(chapter, { chapter, subject, conceptual: 0, numerical: 0, diagram: 0, application: 0, total: 0 });
      }

      const d = diffMap.get(chapter)!;
      d.total++;
      if (item.difficulty === 'easy') d.easy++;
      else if (item.difficulty === 'medium') d.medium++;
      else if (item.difficulty === 'hard') d.hard++;

      const t = typeMap.get(chapter)!;
      t.total++;
      const cog = ((item.metadata || {}) as Record<string, unknown>).cognitiveType;
      if (cog === 'conceptual') t.conceptual++;
      else if (cog === 'numerical') t.numerical++;
      else if (cog === 'diagram') t.diagram++;
      else if (cog === 'application') t.application++;
    }

    const dList: ChapterDifficultyDist[] = Array.from(diffMap.values()).map((d) => ({
      ...d,
      easyPct: Math.round((d.easy / (d.total || 1)) * 100),
      mediumPct: Math.round((d.medium / (d.total || 1)) * 100),
      hardPct: Math.round((d.hard / (d.total || 1)) * 100),
    }));

    const tList: ChapterTypeDist[] = Array.from(typeMap.values()).map((t) => ({
      ...t,
      conceptualPct: Math.round((t.conceptual / (t.total || 1)) * 100),
      numericalPct: Math.round((t.numerical / (t.total || 1)) * 100),
      diagramPct: Math.round((t.diagram / (t.total || 1)) * 100),
      applicationPct: Math.round((t.application / (t.total || 1)) * 100),
    }));

    return { difficultyDist: dList, typeDist: tList };
  }, [items]);

  const uniqueChapters = useMemo(() => {
    return heatmapMatrix.map((m) => ({ name: m.chapter, subject: m.subject }));
  }, [heatmapMatrix]);

  const status = loading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'success';

  return (
    <div className="animate-slide-up max-w-7xl mx-auto space-y-6">
      {/* Top Level Diagnostic Scope Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-sm">
              CBSE Class 10 Forensic Repository
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              2015 – 2024 Exam Spectrum
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Class 10 Science + Maths, 2015-2024, {items.length} questions
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Explore 10 years of marks trends, recurrent concept patterns, and official board question distributions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div className="text-base font-extrabold text-[var(--color-accent)]">{items.length}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">PYQs Analyzed</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div className="text-base font-extrabold text-[var(--color-text)]">27</div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Chapters</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">10</div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Years</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[var(--color-border)] gap-1 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('heatmap')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ' +
            (activeTab === 'heatmap'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-subtle)]/40 rounded-t-lg'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]')
          }
        >
          <Grid className="w-3.5 h-3.5" />
          1. Chapter Marks Heatmap
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('repeat-ranking')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ' +
            (activeTab === 'repeat-ranking'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-subtle)]/40 rounded-t-lg'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]')
          }
        >
          <Flame className="w-3.5 h-3.5" />
          2. Concept Repeat Ranking
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('difficulty-type')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ' +
            (activeTab === 'difficulty-type'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-subtle)]/40 rounded-t-lg'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]')
          }
        >
          <BarChart3 className="w-3.5 h-3.5" />
          3. Difficulty & Cognitive Type
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('browser')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ' +
            (activeTab === 'browser'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-subtle)]/40 rounded-t-lg'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]')
          }
        >
          <Search className="w-3.5 h-3.5" />
          4. Forensic Question Browser ({items.length})
        </button>
      </div>

      {/* StateShell for Loading / Error / Empty States */}
      <StateShell
        status={status}
        error={error}
        onRetry={reload}
        emptyTitle="No PYQ Data Available"
        emptyDescription="Please run the dataset generation script to populate the PYQ repository."
      >
        {activeTab === 'heatmap' && (
          <HeatmapView
            items={items}
            matrix={heatmapMatrix}
            years={ALL_YEARS}
            onSelectQuestion={(q) => setSelectedQuestion(q)}
          />
        )}

        {activeTab === 'repeat-ranking' && (
          <RepeatRankingView
            rankings={conceptRankings}
            allYears={ALL_YEARS}
            onSelectQuestion={(q) => setSelectedQuestion(q)}
          />
        )}

        {activeTab === 'difficulty-type' && (
          <DifficultyTypeView
            difficultyDist={difficultyDist}
            typeDist={typeDist}
            items={items}
          />
        )}

        {activeTab === 'browser' && (
          <QuestionBrowser
            items={items}
            chapters={uniqueChapters}
            onSelectQuestion={(q) => setSelectedQuestion(q)}
          />
        )}
      </StateShell>

      {/* Full Question Detail Breakdown Drawer */}
      <QuestionDetailDrawer
        item={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        allQuestions={items}
        onSelectSibling={(sib) => setSelectedQuestion(sib)}
      />
    </div>
  );
}
