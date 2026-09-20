import React, { useState } from 'react';
import type { VerifiedExplanationExtended } from '../types';
import { Card } from '@components/Card';
import {
  CheckSquare,
  Square,
  Key,
  AlertTriangle,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface AnswerCoachPanelProps {
  explanation: VerifiedExplanationExtended;
  highlightKeywords: boolean;
  onToggleHighlightKeywords: () => void;
}

export function AnswerCoachPanel({
  explanation,
  highlightKeywords,
  onToggleHighlightKeywords,
}: AnswerCoachPanelProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isExaminerOpen, setIsExaminerOpen] = useState(false);

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const totalMarks = explanation.markingBreakdown.reduce((acc, m) => acc + m.marks, 0);
  const earnedMarks = explanation.markingBreakdown.reduce((acc, m, idx) => {
    return acc + (checkedItems[idx] ? m.marks : 0);
  }, 0);

  return (
    <div className="space-y-5 pt-4 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
              Answer Coach Panel
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Self-audit rubric, mandatory keywords, and examiner insights
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)]">
          Audit Score: {earnedMarks}/{totalMarks}m
        </span>
      </div>

      {/* 1. Mark-Wise Breakdown Checklist */}
      <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-[var(--color-accent)]" />
            Mark-Wise Checklist (What Earns Each Mark)
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)] font-normal">
            Click to audit your own answer
          </span>
        </div>

        <div className="space-y-2">
          {explanation.markingBreakdown.map((item, idx) => {
            const isChecked = Boolean(checkedItems[idx]);
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={
                  'flex items-start gap-2.5 p-2.5 rounded-lg text-xs cursor-pointer transition-colors border ' +
                  (isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--color-text)]'
                    : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
                }
              >
                <button type="button" className="mt-0.5 shrink-0 text-[var(--color-accent)]">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-[var(--color-text-muted)]" />
                  )}
                </button>
                <div className="flex-1 flex items-start justify-between gap-2">
                  <span className={isChecked ? 'font-medium' : ''}>{item.criterion}</span>
                  <span className="font-bold text-[11px] shrink-0 px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
                    +{item.marks}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Required Keywords */}
      <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
            <Key className="w-4 h-4 text-amber-500" />
            Mandatory Board Keywords ({explanation.requiredKeywords.length})
          </div>
          <button
            type="button"
            onClick={onToggleHighlightKeywords}
            className={
              'text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ' +
              (highlightKeywords
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]')
            }
          >
            {highlightKeywords ? 'Highlights Active' : 'Highlight in Model Answer'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {explanation.requiredKeywords.map((kw) => (
            <span
              key={kw}
              className={
                'text-xs px-2.5 py-1 rounded-full font-medium transition-colors border ' +
                (highlightKeywords
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 font-bold'
                  : 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] border-[var(--color-border)]')
              }
            >
              {kw}
            </span>
          ))}
        </div>
      </Card>

      {/* 3. Diagram Guidance (Lazy-loaded aspect ratio placeholder) */}
      {explanation.diagramGuidance && (
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            Diagram Directive: {explanation.diagramGuidance.required ? 'Mandatory Diagram Required' : 'No Diagram Required'}
          </div>

          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {explanation.diagramGuidance.description}
          </p>

          {explanation.diagramGuidance.required && (
            <div className="space-y-2.5">
              {explanation.diagramGuidance.placeholderFigure && (
                <div className="w-full aspect-[16/9] max-h-[220px] rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-subtle)] flex items-center justify-center shadow-inner">
                  <img
                    src={explanation.diagramGuidance.placeholderFigure}
                    alt={explanation.diagramGuidance.title || 'Diagram schematic'}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-1.5">
                <span className="text-[11px] font-bold text-[var(--color-text)] block">
                  Mandatory Labels to Include:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {explanation.diagramGuidance.labelsToInclude.map((lbl) => (
                    <span
                      key={lbl}
                      className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] font-medium"
                    >
                      ✓ {lbl}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 4. Common Mistakes & Point Deductions */}
      {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            Common Student Mistakes & Typical Point Deductions
          </div>
          <ul className="text-xs space-y-1.5 text-[var(--color-text-muted)] pl-1">
            {explanation.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. How an Examiner Reads This (Collapsible Note) */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExaminerOpen(!isExaminerOpen)}
          className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            How an Examiner Reads This (Grading Psychology)
          </span>
          {isExaminerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExaminerOpen && (
          <div className="p-4 pt-1 border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-xs leading-relaxed text-[var(--color-text-muted)] animate-in fade-in duration-150">
            <p>{explanation.examinerPerspective}</p>
          </div>
        )}
      </div>

      {/* Always Visible Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 pt-3 pb-1 text-[11px] text-[var(--color-text-muted)]">
        <Info className="w-3.5 h-3.5 shrink-0 text-[var(--color-accent)]" />
        <span>AI-generated verification reference — verify official solutions with your teacher.</span>
      </div>
    </div>
  );
}
