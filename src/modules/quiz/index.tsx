// src/modules/quiz/index.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useCollection, recordBatchAttempts, loadStore, ratingToMasteryPercent } from '@core';
import { StateShell } from '@components/StateShell';
import { QuizSetup } from './components/QuizSetup';
import { QuizActive } from './components/QuizActive';
import { QuizReview } from './components/QuizReview';
import type { QuizConfigState, QuizQuestion, QuizSessionSummary } from './types';
import type { Difficulty, ContentItem } from '@core';

export function QuizModule() {
  const { collection, items: rawItems, loading, error, reload } = useCollection('question-bank.json');

  // Available unique chapters
  const allChapters = useMemo(() => {
    const set = new Set<string>();
    for (const item of rawItems) {
      if (item.chapter) set.add(item.chapter);
    }
    return Array.from(set).sort();
  }, [rawItems]);

  const [phase, setPhase] = useState<'setup' | 'active' | 'review'>('setup');

  const [config, setConfig] = useState<QuizConfigState>(() => ({
    mode: 'daily',
    questionCount: 10,
    timeLimitSec: 10 * 60,
    selectedChapters: [],
    difficulties: ['easy', 'medium', 'hard'] as Difficulty[],
  }));

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [summary, setSummary] = useState<QuizSessionSummary | null>(null);

  // Candidate pool matching config
  const matchingPool = useMemo(() => {
    return rawItems.filter((item) => {
      if (item.kind !== 'question') return false;
      if (
        config.selectedChapters.length > 0 &&
        item.chapter &&
        !config.selectedChapters.includes(item.chapter)
      ) {
        return false;
      }
      if (item.difficulty && !config.difficulties.includes(item.difficulty)) {
        return false;
      }
      return true;
    });
  }, [rawItems, config.selectedChapters, config.difficulties]);

  // Start Quiz
  const handleStartQuiz = useCallback(() => {
    const pool = matchingPool.length > 0 ? matchingPool : rawItems;
    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(config.questionCount, pool.length));

    const initialQuestions: QuizQuestion[] = selected.map((item) => ({
      item,
      selectedOptionIndex: undefined,
      selectedAnswerText: undefined,
      isCorrect: undefined,
      timeTakenSec: Math.round(config.timeLimitSec / selected.length),
      flaggedForReview: false,
    }));

    setActiveQuestions(initialQuestions);
    setPhase('active');
  }, [matchingPool, rawItems, config]);

  // Answer single question
  const handleAnswerQuestion = useCallback(
    (index: number, optionIndex: number, text: string) => {
      setActiveQuestions((prev) => {
        const next = [...prev];
        const q = next[index];
        const item = q.item;

        // Check correctness:
        // Option 0 is correct by convention if options are generated, or check correctAnswer
        const correctAnswer =
          (item.metadata?.correctAnswer as string) || (item.metadata?.answer as string) || '';
        const isCorrect =
          optionIndex === 0 ||
          (Boolean(correctAnswer) && text.toLowerCase().includes(correctAnswer.toLowerCase()));

        next[index] = {
          ...q,
          selectedOptionIndex: optionIndex,
          selectedAnswerText: text,
          isCorrect,
        };
        return next;
      });
    },
    [],
  );

  // Toggle flag
  const handleToggleFlag = useCallback((index: number) => {
    setActiveQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], flaggedForReview: !next[index].flaggedForReview };
      return next;
    });
  }, []);

  // Submit quiz and calculate results & feed progress store
  const handleSubmitQuiz = useCallback(() => {
    const storeBefore = loadStore();
    const evaluatedQuestions = activeQuestions.map((q) => {
      const isCorrect = q.isCorrect ?? false;
      return {
        ...q,
        isCorrect,
      };
    });

    const correctCount = evaluatedQuestions.filter((q) => q.isCorrect).length;
    const totalQuestions = evaluatedQuestions.length;
    const accuracyPercent = Math.round((correctCount / totalQuestions) * 100);
    const totalTimeSec = config.timeLimitSec;
    const avgTimePerQuestionSec = Math.round(totalTimeSec / totalQuestions);

    // Prepare attempt records for store
    const newAttempts = evaluatedQuestions.map((q) => ({
      itemId: q.item.id,
      correct: q.isCorrect ?? false,
      timeTaken: q.timeTakenSec || 30,
      timestamp: Date.now(),
      sourceModule: 'quiz',
      difficulty: q.item.difficulty || 'medium',
      concepts: q.item.concepts || [q.item.chapter || 'General STEM'],
      selectedOption: q.selectedAnswerText,
    }));

    // Record atomically into core progress store
    recordBatchAttempts(newAttempts);

    // Calculate concept Elo changes
    const storeAfter = loadStore();
    const touchedConcepts = new Set<string>();
    for (const q of evaluatedQuestions) {
      for (const c of q.item.concepts || [q.item.chapter || 'General STEM']) {
        touchedConcepts.add(c);
      }
    }

    const conceptChanges = Array.from(touchedConcepts).map((concept) => {
      const oldRating = storeBefore.conceptMasteries[concept]?.rating ?? 1200;
      const newRating = storeAfter.conceptMasteries[concept]?.rating ?? 1200;
      return {
        concept,
        oldRating,
        newRating,
        delta: newRating - oldRating,
        masteryPercent: ratingToMasteryPercent(newRating),
      };
    });

    const sessionSummary: QuizSessionSummary = {
      mode: config.mode,
      totalQuestions,
      correctCount,
      accuracyPercent,
      totalTimeSec,
      avgTimePerQuestionSec,
      conceptChanges,
      questions: evaluatedQuestions,
      completedAt: Date.now(),
    };

    setSummary(sessionSummary);
    setPhase('review');
  }, [activeQuestions, config]);

  if (loading) {
    return <StateShell state="loading" title="Loading Quiz Pool..." message="Fetching question bank items." />;
  }

  if (error) {
    return (
      <StateShell
        state="error"
        title="Failed to Load Quiz Data"
        message={error.message}
        onRetry={reload}
      />
    );
  }

  if (rawItems.length === 0) {
    return (
      <StateShell
        state="empty"
        title="Question Bank Empty"
        message="No practice questions are available at this time."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Scope Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
          {collection?.scopeLabel || 'Adaptive Practice Quiz Engine'}
        </span>
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
          Adaptive Practice Quiz
        </h1>
      </div>

      {phase === 'setup' && (
        <QuizSetup
          config={config}
          availableChapters={allChapters}
          onChange={setConfig}
          onStart={handleStartQuiz}
          totalQuestionsAvailable={matchingPool.length > 0 ? matchingPool.length : rawItems.length}
        />
      )}

      {phase === 'active' && (
        <QuizActive
          questions={activeQuestions}
          timeLimitSec={config.timeLimitSec}
          onAnswerQuestion={handleAnswerQuestion}
          onToggleFlag={handleToggleFlag}
          onSubmit={handleSubmitQuiz}
        />
      )}

      {phase === 'review' && summary && (
        <QuizReview summary={summary} onRetake={() => setPhase('setup')} />
      )}
    </div>
  );
}
