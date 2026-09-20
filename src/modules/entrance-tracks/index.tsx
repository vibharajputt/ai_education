import React, { useState, useEffect, useMemo } from 'react';
import type { QuestionItem } from '@core/types';
import {
  StateShell,
  Card,
  Badge,
  MarkdownRenderer,
  StatTile,
} from '../../components';
import { HeatmapView } from '../pyq-analyzer/components/HeatmapView';
import type { ChapterHeatmapRow } from '../pyq-analyzer/types';
import {
  Target,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  BookOpen,
  Layers,
  BarChart2,
} from 'lucide-react';

interface SyllabusChapter {
  name: string;
  weightage: string;
  topics: string[];
}

interface SyllabusSubject {
  subject: string;
  chapters: SyllabusChapter[];
}

interface EntranceData {
  collection: {
    id: string;
    title: string;
    description: string;
    scopeLabel: string;
    filters: {
      examTrack: string[];
      difficulty: string[];
    };
  };
  syllabi: Record<string, SyllabusSubject[]>;
  heatmapData: ChapterHeatmapRow[];
  items: QuestionItem[];
}

export const EntranceTracksModule: React.FC = () => {
  const [data, setData] = useState<EntranceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [selectedExam, setSelectedExam] = useState<string>('JEE Main');
  const [activeView, setActiveView] = useState<'syllabus' | 'pyqs' | 'heatmap'>('pyqs');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/content/entrance-tracks.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (mounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const exams = useMemo(() => ['JEE Main', 'NEET UG', 'CLAT Law', 'CA Foundation'], []);

  const examPyqs = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item: QuestionItem) => item.metadata?.examTrack === selectedExam);
  }, [data, selectedExam]);

  const currentSyllabus = useMemo(() => {
    if (!data?.syllabi) return [];
    return data.syllabi[selectedExam] || [];
  }, [data, selectedExam]);

  const years = useMemo(() => [2020, 2021, 2022, 2023, 2024], []);

  if (loading || error || !data) {
    return (
      <StateShell
        status={loading ? 'loading' : error ? 'error' : 'empty'}
        error={error}
      />
    );
  }

  const { collection, heatmapData } = data;

  const toggleChapter = (chapterName: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterName]: !prev[chapterName],
    }));
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const toggleSolution = (questionId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleCellClick = (chapter: string) => {
    setSelectedChapterFilter(chapter);
    setActiveView('pyqs');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-900/30 to-background border border-emerald-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label="C" variant="tier" />
              <Badge label="both" variant="track" />
              <span className="text-xs text-[var(--color-text-muted)] font-mono font-medium">
                {collection.scopeLabel}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)]">
              {collection.title}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] max-w-2xl">
              {collection.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatTile label="Selected Exam" value={selectedExam} icon={<Target className="w-4 h-4 text-emerald-400" />} />
          <StatTile label="Solved PYQs" value={`${examPyqs.length} Qs`} icon={<BookOpen className="w-4 h-4 text-teal-400" />} />
          <StatTile label="Total Exams" value={exams.length} icon={<Layers className="w-4 h-4 text-indigo-400" />} />
          <StatTile label="Heatmap Chapters" value={heatmapData.length} icon={<BarChart2 className="w-4 h-4 text-amber-400" />} />
        </div>
      </div>

      {/* Exam Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto">
        {exams.map((exam) => (
          <button
            key={exam}
            type="button"
            onClick={() => {
              setSelectedExam(exam);
              setSelectedChapterFilter(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              selectedExam === exam
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {exam}
          </button>
        ))}
      </div>

      {/* Sub-view switcher */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('pyqs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeView === 'pyqs'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Previous Year Questions ({examPyqs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('syllabus')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeView === 'syllabus'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Syllabus Map & Weightage
          </button>
          <button
            type="button"
            onClick={() => setActiveView('heatmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeView === 'heatmap'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Trend Heatmap
          </button>
        </div>

        {selectedChapterFilter && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--color-text-muted)]">Filtering: {selectedChapterFilter}</span>
            <button
              type="button"
              onClick={() => setSelectedChapterFilter(null)}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: PYQs */}
      {activeView === 'pyqs' && (
        <div className="space-y-4">
          {examPyqs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm">
              No PYQs loaded for {selectedExam}.
            </div>
          ) : (
            examPyqs.map((item: QuestionItem, idx: number) => {
              const selectedOpt = userAnswers[item.id];
              const isRevealed = revealedSolutions[item.id];
              const options = item.metadata?.options as string[] | undefined;
              const correctIdx = item.metadata?.correctOptionIndex as number | undefined;
              const solution = item.metadata?.solution as string | undefined;

              return (
                <Card key={item.id} className="p-5 space-y-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        PYQ {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {selectedExam}
                      </span>
                      {'year' in item && item.year && (
                        <span className="px-2 py-0.5 text-xs font-mono rounded bg-[var(--color-surface-subtle)] border text-[var(--color-text-muted)]">
                          {String(item.year)}
                        </span>
                      )}
                      <Badge label={item.difficulty || 'medium'} variant="difficulty" />
                      <span className="text-xs text-[var(--color-text-muted)] font-medium">
                        {item.subject} • {item.chapter}
                      </span>
                    </div>

                    {item.concepts && item.concepts.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.concepts.map((c: string) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 text-[10px] rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-[var(--color-text)] leading-relaxed font-medium">
                    <MarkdownRenderer content={item.body} />
                  </div>

                  {options && options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {options.map((opt: string, oIdx: number) => {
                        const isSelected = selectedOpt === oIdx;
                        const isCorrect = correctIdx === oIdx;
                        let btnClass =
                          'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] hover:bg-[var(--color-surface)]';

                        if (selectedOpt !== undefined) {
                          if (isSelected && isCorrect) {
                            btnClass =
                              'border-emerald-500/60 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            btnClass =
                              'border-rose-500/60 bg-rose-500/15 text-rose-600 dark:text-rose-300 font-semibold';
                          } else if (isCorrect) {
                            btnClass =
                              'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectOption(item.id, oIdx)}
                            className={`w-full p-3 text-xs md:text-sm text-left rounded-lg border transition-all flex items-start gap-2.5 ${btnClass}`}
                          >
                            <span className="font-mono text-xs opacity-75 shrink-0">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => toggleSolution(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      {isRevealed ? 'Hide Solution' : 'View Worked Solution'}
                    </button>
                  </div>

                  {isRevealed && solution && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs md:text-sm space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Worked Solution:</span>
                      </div>
                      <div className="text-[var(--color-text-muted)] leading-relaxed font-sans">
                        <MarkdownRenderer content={solution} />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: Syllabus Collapsible Tree */}
      {activeView === 'syllabus' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            Official weighted syllabus tree for <strong className="text-[var(--color-text)]">{selectedExam}</strong>. Click any chapter to inspect high-frequency topics.
          </div>

          {currentSyllabus.map((sub: SyllabusSubject) => (
            <Card key={sub.subject} className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  {sub.subject}
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/15 text-emerald-400">
                  {sub.chapters.length} Modules
                </span>
              </div>

              <div className="space-y-2">
                {sub.chapters.map((chap: SyllabusChapter) => {
                  const isExpanded = !!expandedChapters[chap.name];
                  return (
                    <div
                      key={chap.name}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleChapter(chap.name)}
                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[var(--color-surface)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                          )}
                          <span className="text-xs md:text-sm font-semibold text-[var(--color-text)]">
                            {chap.name}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-500/15 text-indigo-400">
                          Weightage: {chap.weightage}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] space-y-2 text-xs">
                          <span className="font-semibold text-[var(--color-text-muted)] block">
                            Key Exam Topics:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {chap.topics.map((t: string) => (
                              <span
                                key={t}
                                className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VIEW 3: Trend Heatmap */}
      {activeView === 'heatmap' && (
        <div className="space-y-4">
          <HeatmapView
            rows={heatmapData}
            years={years}
            onCellClick={handleCellClick}
          />
        </div>
      )}
    </div>
  );
};
