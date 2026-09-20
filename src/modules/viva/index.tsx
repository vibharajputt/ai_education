import React, { useState } from 'react';
import { useCollection } from '@core/loaders';
import { recordAttempt } from '@core/progress';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';

export function VivaModule() {
  const { items, loading, error, reload } = useCollection('viva.json');
  const [activeTab, setActiveTab] = useState<'browser' | 'quiz'>('quiz');

  // Filter states
  const [selectedExpFilter, setSelectedExpFilter] = useState<string>('All');
  const [selectedDiffFilter, setSelectedDiffFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quiz mode states
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [scoreStats, setScoreStats] = useState<{ mastered: number; total: number }>({
    mastered: 0,
    total: 0,
  });
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Filter questions
  const filteredItems = items.filter((item) => {
    const meta = item.metadata as any;
    const matchesExp =
      selectedExpFilter === 'All' || meta?.expTag === selectedExpFilter;
    const matchesDiff =
      selectedDiffFilter === 'All' || item.difficulty === selectedDiffFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.body.toLowerCase().includes(q) ||
      meta?.modelAnswer?.toLowerCase().includes(q) ||
      item.concepts.some((c) => c.toLowerCase().includes(q));

    return matchesExp && matchesDiff && matchesSearch;
  });

  const currentQuizItem = filteredItems[quizIndex] || filteredItems[0];

  const handleSelfScore = (correct: boolean) => {
    if (!currentQuizItem) return;

    // Record attempt in shared progress store
    recordAttempt({
      itemId: currentQuizItem.id,
      conceptTags: currentQuizItem.concepts,
      subject: currentQuizItem.subject || 'Practical Science',
      correct,
      timeTakenSec: 15,
      sourceModule: 'viva',
    });

    setScoreStats((prev) => ({
      mastered: prev.mastered + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    // Move to next question
    setShowAnswer(false);
    if (quizIndex < filteredItems.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIndex(0);
    }
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <StateShell status="loading" />;
  }

  if (error) {
    return <StateShell status="error" error={error} onRetry={reload} />;
  }

  if (items.length === 0) {
    return <StateShell status="empty" emptyTitle="No viva questions found." />;
  }

  const expTags = ['All', 'Exp 1', 'Exp 2', 'Exp 3', 'Exp 4', 'Exp 5', 'Exp 6', 'Exp 7', 'Exp 8'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">
              Practical Science Viva Voce Coach
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Self-Scored Quiz Mode · Feeds Real-Time Progress Store
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-medium">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            "Quiz Me" Mode
          </button>
          <button
            onClick={() => setActiveTab('browser')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'browser'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Browse All ({filteredItems.length})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Experiment Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mr-1">
              Exp:
            </span>
            {expTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedExpFilter(tag);
                  setQuizIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedExpFilter === tag
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              Difficulty:
            </span>
            {['All', 'easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setSelectedDiffFilter(diff);
                  setQuizIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  selectedDiffFilter === diff
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search viva questions (e.g. lime water, resistance, stomata)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* ── TAB 1: "QUIZ ME" MODE ── */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress / Score Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>
                Session Score:{' '}
                <strong className="text-[var(--color-text)]">
                  {scoreStats.mastered} / {scoreStats.total}
                </strong>{' '}
                ({scoreStats.total > 0 ? Math.round((scoreStats.mastered / scoreStats.total) * 100) : 0}%)
              </span>
            </div>

            <div className="text-[var(--color-text-muted)]">
              Question {quizIndex + 1} of {filteredItems.length}
            </div>
          </div>

          {/* Active Question Card */}
          {currentQuizItem ? (
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    label={(currentQuizItem.metadata as any)?.expTag || 'Exp'}
                    variant="tier"
                  />
                  <Badge label={currentQuizItem.subject || 'Science'} variant="default" />
                </div>
                <Badge label={currentQuizItem.difficulty || 'medium'} variant="difficulty" />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[var(--color-text)] leading-relaxed">
                  {currentQuizItem.body}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {currentQuizItem.concepts.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[10px] text-[var(--color-text-muted)] font-mono"
                    >
                      #{c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reveal Answer Action */}
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-3 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold text-xs border border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Reveal Model Answer & Examiner Tip
                </button>
              ) : (
                <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
                  {/* Model Answer Box */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <span className="font-bold text-emerald-500 uppercase tracking-wider block text-[11px]">
                      Model Answer
                    </span>
                    <p className="text-[var(--color-text)] leading-relaxed font-medium">
                      {(currentQuizItem.metadata as any)?.modelAnswer}
                    </p>
                  </div>

                  {/* Examiner Tip Box */}
                  {(currentQuizItem.metadata as any)?.examinerTip && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 space-y-0.5">
                      <span className="font-bold uppercase tracking-wider block text-[10px]">
                        Examiner Pro-Tip
                      </span>
                      <p className="text-slate-300 text-[11px] leading-snug">
                        {(currentQuizItem.metadata as any)?.examinerTip}
                      </p>
                    </div>
                  )}

                  {/* Self Scoring Buttons */}
                  <div className="pt-2 space-y-2">
                    <p className="text-center text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      How did you answer? (Feeds Progress Store)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSelfScore(false)}
                        className="py-2.5 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Needs Review (0%)
                      </button>
                      <button
                        onClick={() => handleSelfScore(true)}
                        className="py-2.5 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Got It Right! (100%)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                No questions match the current filters.
              </p>
              <button
                onClick={() => {
                  setSelectedExpFilter('All');
                  setSelectedDiffFilter('All');
                  setSearchQuery('');
                  setQuizIndex(0);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: BROWSE ALL QUESTION BANK ── */}
      {activeTab === 'browser' && (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const meta = item.metadata as any;
            const isExpanded = !!expandedCards[item.id];
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge label={meta?.expTag || 'Exp'} variant="tier" />
                      <Badge label={item.subject || 'Science'} variant="default" />
                      <Badge label={item.difficulty || 'medium'} variant="difficulty" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--color-text)] leading-snug">
                      {item.body}
                    </h4>
                  </div>
                  <button
                    onClick={() => toggleExpandCard(item.id)}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] shrink-0 transition-colors"
                    aria-label="Toggle model answer"
                  >
                    {isExpanded ? (
                      <EyeOff className="w-4 h-4 text-[var(--color-accent)]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Collapsible Answer */}
                {isExpanded && (
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2 mt-2">
                    <div>
                      <span className="font-bold text-emerald-500 uppercase tracking-wider block text-[10px]">
                        Model Answer
                      </span>
                      <p className="text-[var(--color-text)] font-medium mt-0.5">
                        {meta?.modelAnswer}
                      </p>
                    </div>
                    {meta?.examinerTip && (
                      <div className="pt-1 border-t border-emerald-500/20">
                        <span className="font-bold text-amber-500 uppercase tracking-wider block text-[10px]">
                          Examiner Tip
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          {meta?.examinerTip}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
