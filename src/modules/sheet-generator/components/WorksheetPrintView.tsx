// src/modules/sheet-generator/components/WorksheetPrintView.tsx
import React from 'react';
import type { WorksheetData } from '../types';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Badge } from '@components/Badge';
import { Award, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface WorksheetPrintViewProps {
  worksheet: WorksheetData;
}

export function WorksheetPrintView({ worksheet }: WorksheetPrintViewProps) {
  const { config, items, coverage } = worksheet;

  return (
    <div className="space-y-8 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 p-6 sm:p-10 rounded-xl border border-[var(--color-border)] shadow-sm print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
      {/* ========================================================================= */}
      {/* SECTION 1: QUESTION PAPER                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center space-y-1.5 print:border-black">
          {config.institutionName && (
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 print:text-slate-700">
              {config.institutionName}
            </p>
          )}
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
            {config.title || 'Practice Examination Worksheet'}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1 print:text-black">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Time Allowed: {config.timeLimitMinutes} Mins
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Maximum Marks: {coverage.totalMarks}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Questions: {items.length}
            </span>
          </div>

          {/* Student Fill-in Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 text-left text-xs text-slate-700 dark:text-slate-300 print:text-black">
            <div className="border border-slate-300 dark:border-slate-700 p-2 rounded print:border-black">
              <span className="font-semibold">Student Name:</span> ___________________
            </div>
            <div className="border border-slate-300 dark:border-slate-700 p-2 rounded print:border-black">
              <span className="font-semibold">Roll / ID No:</span> ___________________
            </div>
            <div className="border border-slate-300 dark:border-slate-700 p-2 rounded print:border-black">
              <span className="font-semibold">Date / Section:</span> ___________________
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1 print:border-slate-400 print:bg-slate-50 print:text-black">
          <p className="font-bold uppercase tracking-wide">General Instructions:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-300 print:text-slate-800">
            <li>Read all questions carefully before attempting.</li>
            <li>All questions are compulsory. Marks are indicated against each question.</li>
            <li>Use neat diagrams and appropriate scientific units wherever necessary.</li>
          </ol>
        </div>

        {/* Questions List */}
        <div className="space-y-6 pt-2 divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
          {items.map((item, index) => {
            const marks = (item as any).marks || (item.difficulty === 'hard' ? 5 : item.difficulty === 'medium' ? 3 : 1);
            const questionType = (item as any).questionType || 'General';

            return (
              <div key={item.id} className="pt-5 first:pt-0 space-y-3 break-inside-avoid">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold print:bg-black print:text-white">
                      {index + 1}
                    </span>
                    <div>
                      {item.chapter && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide print:text-slate-600">
                          {item.chapter}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 print:border-black print:text-black print:bg-transparent">
                      [{marks} {marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                  </div>
                </div>

                {/* Question Body with KaTeX */}
                <div className="pl-8 text-sm sm:text-base leading-relaxed">
                  <MarkdownRenderer content={item.body} />
                </div>

                {/* MCQ Options if available */}
                {Array.isArray(item.metadata?.options) && (
                  <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-sm">
                    {(item.metadata.options as string[]).map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="flex items-start gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 print:border-slate-400 text-xs sm:text-sm"
                      >
                        <span className="font-bold uppercase text-slate-500 print:text-black">
                          ({String.fromCharCode(65 + optIdx)})
                        </span>
                        <div className="flex-1">
                          <MarkdownRenderer content={opt} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Blank Lines if enabled */}
                {config.includeAnswerSpace && questionType !== 'mcq' && (
                  <div className="pl-8 pt-2 space-y-2">
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-700 h-4 print:border-slate-400" />
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-700 h-4 print:border-slate-400" />
                    {marks >= 3 && (
                      <>
                        <div className="border-b border-dashed border-slate-300 dark:border-slate-700 h-4 print:border-slate-400" />
                        <div className="border-b border-dashed border-slate-300 dark:border-slate-700 h-4 print:border-slate-400" />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: SEPARATE ANSWER KEY & SOLUTION PAGE                            */}
      {/* ========================================================================= */}
      {config.includeAnswerKey && (
        <div className="pt-10 border-t-4 border-double border-slate-400 break-before-page page-break-before-always space-y-6 print:pt-0 print:border-t-0">
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-3 print:border-black">
            <span className="text-xs uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400 print:text-black">
              Confidential • Examiner Resource
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white print:text-black">
              Marking Scheme & Detailed Solution Key
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700">
              Worksheet: {config.title || 'Practice Test'} • {items.length} Questions • {coverage.totalMarks} Max Marks
            </p>
          </div>

          <div className="space-y-6 divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300 text-xs sm:text-sm">
            {items.map((item, idx) => {
              const explanation = (item.metadata?.explanation as any) || (item.metadata?.solution as string) || '';
              const steps = Array.isArray(item.metadata?.steps) ? item.metadata.steps : [];
              const answer = (item.metadata?.correctAnswer as string) || (item.metadata?.answer as string) || '';
              const keyPoints = Array.isArray(item.metadata?.keyPoints) ? item.metadata.keyPoints : [];

              return (
                <div key={item.id} className="pt-4 first:pt-0 space-y-2 break-inside-avoid">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white print:text-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 print:text-black" />
                      Q{idx + 1} Model Solution & Marking Rubric
                    </span>
                    {item.chapter && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.chapter}
                      </span>
                    )}
                  </div>

                  {answer && (
                    <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 font-medium text-emerald-900 dark:text-emerald-200 print:bg-slate-100 print:text-black print:border-black">
                      <span className="font-bold">Direct Answer: </span>
                      <span className="font-mono">{answer}</span>
                    </div>
                  )}

                  {typeof explanation === 'string' && explanation && (
                    <div className="pl-4 border-l-2 border-slate-300 dark:border-slate-700 space-y-1 print:border-slate-400">
                      <MarkdownRenderer content={explanation} />
                    </div>
                  )}

                  {steps.length > 0 && (
                    <div className="space-y-1 pl-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300 print:text-black">Step-by-step derivation:</p>
                      {steps.map((st: any, sIdx: number) => (
                        <div key={sIdx} className="text-slate-600 dark:text-slate-400 print:text-black pl-2">
                          <span className="font-semibold">{st.label || `Step ${sIdx + 1}`}: </span>
                          <MarkdownRenderer content={st.body || String(st)} />
                        </div>
                      ))}
                    </div>
                  )}

                  {keyPoints.length > 0 && (
                    <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-400 print:text-black">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">Mark Distribution Criteria: </span>
                      {keyPoints.join(' • ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
