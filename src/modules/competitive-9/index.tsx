import React, { useState, useMemo } from 'react';
import { useCollection } from '@core/loaders';
import type { QuestionItem } from '@core/types';
import {
  StateShell,
  Card,
  Badge,
  MarkdownRenderer,
  StatTile,
} from '../../components';
import { Award, BookOpen, CheckCircle, HelpCircle, Lightbulb, Search } from 'lucide-react';

export const Competitive9Module: React.FC = () => {
  const { collection, items, loading, error } = useCollection('competitive-9.json');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const questionItems = useMemo(() => items as QuestionItem[], [items]);

  const filteredItems = useMemo(() => {
    return questionItems.filter((item) => {
      const examSection = item.metadata?.examSection as string | undefined;
      const matchSection = selectedSection === 'all' || examSection === selectedSection;
      const matchDiff = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
      const matchSearch =
        !searchQuery.trim() ||
        item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.chapter && item.chapter.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSection && matchDiff && matchSearch;
    });
  }, [questionItems, selectedSection, selectedDifficulty, searchQuery]);

  if (loading || error || !collection) {
    return (
      <StateShell
        status={loading ? 'loading' : error ? 'error' : 'empty'}
        error={error}
      />
    );
  }

  const totalQuestions = questionItems.length;
  const ntseCount = questionItems.filter((i) => i.metadata?.examSection === 'NTSE-style').length;
  const nsoCount = questionItems.filter((i) => i.metadata?.examSection === 'NSO').length;
  const imoCount = questionItems.filter((i) => i.metadata?.examSection === 'IMO').length;
  const ieoCount = questionItems.filter((i) => i.metadata?.examSection === 'IEO').length;

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const toggleSolution = (questionId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label="C" variant="tier" />
              <Badge label="school" variant="track" />
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
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Award className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatTile label="Total Questions" value={totalQuestions} icon={<BookOpen className="w-4 h-4 text-indigo-400" />} />
          <StatTile label="NTSE MAT/SAT" value={ntseCount} icon={<HelpCircle className="w-4 h-4 text-blue-400" />} />
          <StatTile label="NSO Science" value={nsoCount} icon={<Award className="w-4 h-4 text-emerald-400" />} />
          <StatTile label="IMO & IEO" value={imoCount + ieoCount} icon={<CheckCircle className="w-4 h-4 text-amber-400" />} />
        </div>
      </div>

      {/* Exam Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto">
        {[
          { id: 'all', label: `All Exams (${totalQuestions})` },
          { id: 'NTSE-style', label: `NTSE-style (${ntseCount})` },
          { id: 'NSO', label: `NSO Science (${nsoCount})` },
          { id: 'IMO', label: `IMO Maths (${imoCount})` },
          { id: 'IEO', label: `IEO English (${ieoCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedSection(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              selectedSection === tab.id
                ? 'bg-indigo-500 text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword, topic, or chapter..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">Difficulty:</span>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                  : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {diff.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm">
            No questions match the selected filters.
          </div>
        ) : (
          filteredItems.map((item: QuestionItem, idx: number) => {
            const selectedOpt = userAnswers[item.id];
            const isRevealed = revealedSolutions[item.id];
            const options = item.metadata?.options as string[] | undefined;
            const correctIdx = item.metadata?.correctOptionIndex as number | undefined;
            const solution = item.metadata?.solution as string | undefined;

            return (
              <Card key={item.id} className="p-5 space-y-4 hover:border-indigo-500/30 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Q{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {String(item.metadata?.examSection || 'Competitive')}
                    </span>
                    <Badge label={item.difficulty || 'medium'} variant="difficulty" />
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">
                      {item.subject} • {item.chapter}
                    </span>
                  </div>

                  {item.concepts && item.concepts.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.concepts.map((concept: string) => (
                        <span
                          key={concept}
                          className="px-2 py-0.5 text-[10px] rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Question Body */}
                <div className="text-sm text-[var(--color-text)] leading-relaxed font-medium">
                  <MarkdownRenderer content={item.body} />
                </div>

                {/* Options if MCQ */}
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

                {/* Actions & Solution Reveal */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => toggleSolution(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {isRevealed ? 'Hide Solution' : 'View Worked Solution'}
                  </button>
                </div>

                {/* Solution Drawer */}
                {isRevealed && solution && (
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs md:text-sm space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                      <CheckCircle className="w-4 h-4 text-indigo-400" />
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
    </div>
  );
};
