import React from 'react';
import type { ContentItem } from '@core/types';
import { getItemYear, getItemMarks } from '../types';
import { Drawer } from '@components/Drawer';
import { Badge } from '@components/Badge';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import {
  Calendar,
  Award,
  BookOpen,
  Tag,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface QuestionDetailDrawerProps {
  item: ContentItem | null;
  onClose: () => void;
  allQuestions?: ContentItem[];
  onSelectSibling?: (item: ContentItem) => void;
}

export function QuestionDetailDrawer({
  item,
  onClose,
  allQuestions = [],
  onSelectSibling,
}: QuestionDetailDrawerProps) {
  if (!item) return null;

  const isQuestion = item.kind === 'question';
  const meta = (item.metadata || {}) as Record<string, unknown>;
  const examSet = typeof meta.examSet === 'string' ? meta.examSet : null;
  const cognitiveType = typeof meta.cognitiveType === 'string' ? meta.cognitiveType : null;

  const siblingQuestions = allQuestions
    .filter(
      (q) =>
        q.id !== item.id &&
        q.concepts &&
        item.concepts &&
        q.concepts.some((c) => item.concepts.includes(c))
    )
    .slice(0, 5);

  const itemMarks = getItemMarks(item) || 3;
  const itemYear = getItemYear(item);

  return (
    <Drawer
      isOpen={Boolean(item)}
      onClose={onClose}
      title={item.subject ? `${item.subject} • ${item.chapter}` : 'Question Details'}
    >
      <div className="space-y-6 pb-6">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {item.kind && <Badge label={item.kind} variant="kind" />}
          {item.difficulty && <Badge label={item.difficulty} variant="difficulty" />}
          {itemYear && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Calendar className="w-3.5 h-3.5" />
              {itemYear} Board Exam
            </span>
          )}
          {itemMarks && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Award className="w-3.5 h-3.5" />
              {itemMarks} Marks
            </span>
          )}
          {cognitiveType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
              {cognitiveType}
            </span>
          )}
          {examSet && (
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              Set {examSet}
            </span>
          )}
        </div>

        {/* Question Body */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text)] leading-relaxed">
            <MarkdownRenderer content={item.body} />
          </div>

          {item.latex && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm overflow-x-auto">
              <MarkdownRenderer content={'$$' + item.latex + '$$'} />
            </div>
          )}
        </div>

        {/* Concepts */}
        {item.concepts && item.concepts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              <Tag className="w-3.5 h-3.5" />
              Tested Concepts
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.concepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Marking Scheme Breakdown */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            CBSE Official Marking Blueprint
          </div>
          <ul className="text-xs space-y-1.5 text-[var(--color-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>
                <strong className="text-[var(--color-text)]">Step 1 ({Math.max(1, Math.floor(itemMarks / 3))} mark):</strong> Correct formula / chemical reaction / definition with units.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>
                <strong className="text-[var(--color-text)]">Step 2 ({Math.max(1, Math.floor(itemMarks / 2))} mark):</strong> Stepwise substitution, calculation, or balanced reaction intermediate.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>
                <strong className="text-[var(--color-text)]">Step 3 (1 mark):</strong> Accurate final answer highlighted with explicit standard SI units and concluding statement.
              </span>
            </li>
          </ul>
        </div>

        {siblingQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
                Sibling PYQs on Same Concept ({siblingQuestions.length})
              </div>
            </div>
            <div className="space-y-2">
              {siblingQuestions.map((sib) => {
                const sibYear = getItemYear(sib);
                const sibMarks = getItemMarks(sib);
                return (
                  <div
                    key={sib.id}
                    onClick={() => onSelectSibling?.(sib)}
                    className="p-3 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {sibYear} Exam
                      </span>
                      <span className="text-[var(--color-text-muted)]">
                        {sibMarks} Marks • {sib.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text)] line-clamp-2">
                      {sib.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
