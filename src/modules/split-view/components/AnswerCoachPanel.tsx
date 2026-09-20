import React, { useState } from 'react';
import { AnswerCoachData } from '../types';
import { CheckSquare, Square, Tag, Image, AlertTriangle, ChevronDown, ChevronUp, Award, HelpCircle } from 'lucide-react';

interface AnswerCoachPanelProps {
  coachData: AnswerCoachData;
  totalMarks?: number;
}

export const AnswerCoachPanel: React.FC<AnswerCoachPanelProps> = ({ coachData, totalMarks = 3 }) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [showExaminerNote, setShowExaminerNote] = useState<boolean>(false);

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedMarks = coachData.markingBreakdown.reduce((sum, item, idx) => {
    return checkedItems[idx] ? sum + item.marks : sum;
  }, 0);

  return (
    <div className="space-y-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--color-accent)]" />
          <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-wide">
            Examiner Answer Coach
          </h3>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
          Earned: {completedMarks} / {totalMarks} Marks
        </div>
      </div>

      {/* 1. Mark-wise Breakdown Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Mark-wise Scheme Checklist</span>
          <span className="text-[11px] font-normal">Check off as you write</span>
        </div>

        <div className="space-y-1.5">
          {coachData.markingBreakdown.map((item, idx) => {
            const isChecked = Boolean(checkedItems[idx]);
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-[var(--color-text)]'
                    : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <button type="button" className="mt-0.5 shrink-0 text-[var(--color-accent)]">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`font-medium ${isChecked ? 'line-through opacity-80' : ''}`}>
                    {item.criterion}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] font-bold text-[11px] shrink-0 border border-[var(--color-border)]">
                  +{item.marks} M
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Required Keywords */}
      {coachData.requiredKeywords && coachData.requiredKeywords.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-sky-500" />
            Mandatory Keywords
          </div>
          <div className="flex flex-wrap gap-1.5">
            {coachData.requiredKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-500/30"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Diagram Guidance */}
      {coachData.diagramNote && (
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
          <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
            <Image className="w-4 h-4" />
            Diagram Requirement
          </div>
          <p className="text-[var(--color-text)] font-medium leading-relaxed">
            {coachData.diagramNote}
          </p>
        </div>
      )}

      {/* 4. Common Mistakes */}
      {coachData.commonMistakes && coachData.commonMistakes.length > 0 && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-1.5">
          <div className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Common Student Deductions & Traps
          </div>
          <ul className="list-disc list-inside space-y-1 text-[var(--color-text)] font-medium">
            {coachData.commonMistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Collapsible "How an Examiner Reads This" Note */}
      {coachData.examinerNote && (
        <div className="border-t border-[var(--color-border)] pt-3">
          <button
            type="button"
            onClick={() => setShowExaminerNote((prev) => !prev)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-text)] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              How an Examiner Reads This
            </span>
            {showExaminerNote ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showExaminerNote && (
            <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-[var(--color-text)] font-medium leading-relaxed">
              {coachData.examinerNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
