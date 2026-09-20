import React, { useState } from 'react';
import type { ContentItem } from '@core/types';
import type { VerifiedExplanationExtended } from '../types';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { AnswerCoachPanel } from './AnswerCoachPanel';
import { SolutionAssistant } from './SolutionAssistant';
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface SolutionPaneProps {
  item: ContentItem | null;
  explanation: VerifiedExplanationExtended | null;
  highlightKeywords: boolean;
  onToggleHighlightKeywords: () => void;
  questionNumber: number;
}

export function SolutionPane({
  item,
  explanation,
  highlightKeywords,
  onToggleHighlightKeywords,
  questionNumber,
}: SolutionPaneProps) {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[var(--color-bg)]">
        <BookOpen className="w-12 h-12 text-[var(--color-text-muted)]/40 mb-3" />
        <h3 className="text-sm font-bold text-[var(--color-text)]">Select a Question</h3>
        <p className="text-xs text-[var(--color-text-muted)] max-w-xs mt-1">
          Click any question from the examination paper on the left or press J/K to inspect its verified marking breakdown.
        </p>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[var(--color-bg)] space-y-3">
        <HelpCircle className="w-12 h-12 text-amber-500/50 mb-1" />
        <h3 className="text-sm font-bold text-[var(--color-text)]">
          Solution Pending Verification
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] max-w-sm leading-relaxed">
          The verified solution for this specific set variant is currently being vetted by the senior board examiner panel.
        </p>
      </div>
    );
  }

  const marks = ('marks' in item ? (item as { marks?: number }).marks : undefined) || 3;

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-5 space-y-6" id="solution-pane-scroll-container">
      {/* Solution Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--color-accent)] text-white shadow-sm font-bold text-xs">
            Q{questionNumber}
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
              Verified Model Solution & Breakdown
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {item.subject} • {item.chapter}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          {marks} Marks
        </span>
      </div>

      {/* Model Answer Presentation */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          CBSE Model Answer Script
        </div>

        <div className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed prose dark:prose-invert max-w-none">
          <MarkdownRenderer content={explanation.modelAnswer} />
        </div>
      </div>

      {/* Step-by-Step Worked Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          <Layers className="w-4 h-4 text-[var(--color-accent)]" />
          Step-by-Step Derivation & Logic
        </div>

        <div className="space-y-2.5">
          {explanation.steps.map((st, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1.5"
            >
              <h4 className="text-xs font-bold text-[var(--color-text)]">
                {st.label}
              </h4>
              <div className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                <MarkdownRenderer content={st.body} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Answer Coach Panel */}
      <AnswerCoachPanel
        explanation={explanation}
        highlightKeywords={highlightKeywords}
        onToggleHighlightKeywords={onToggleHighlightKeywords}
      />

      {/* Live AI Assistant Action Bar & Streaming Thread */}
      <SolutionAssistant
        item={item}
        questionNumber={questionNumber}
      />
    </div>
  );
}
