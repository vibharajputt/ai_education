// src/modules/sheet-generator/components/WorksheetPrintView.tsx
import React, { useState } from 'react';
import type { WorksheetData } from '../types';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Award, Clock, FileText, CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Building2 } from 'lucide-react';

interface WorksheetPrintViewProps {
  worksheet: WorksheetData;
  showSolutionsGlobal?: boolean;
}

export function WorksheetPrintView({ worksheet, showSolutionsGlobal = false }: WorksheetPrintViewProps) {
  const { config, items, coverage } = worksheet;
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-8 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
      {/* ========================================================================= */}
      {/* SECTION 1: CLEAN MODERN TEST HEADER & QUESTIONS                            */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Modern Test Title & Stats Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {config.institutionName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{config.institutionName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{config.timeLimitMinutes} Mins</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{coverage.totalMarks} Marks</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>{items.length} Questions</span>
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {config.title || 'Technical Assessment & Practice Test'}
          </h1>
        </div>

        {/* Questions List */}
        <div className="space-y-6 pt-2 divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
          {items.map((item, index) => {
            const marks =
              (item as any).marks ||
              (item as any).metadata?.marks ||
              (item.difficulty === 'hard' ? 5 : item.difficulty === 'medium' ? 3 : 2);
            const questionType = (item as any).questionType || (item as any).metadata?.questionType || 'General';
            const options: string[] = Array.isArray(item.metadata?.options) ? item.metadata.options : [];
            const correctOptIdx = item.metadata?.correctOptionIndex;
            const solution = (item.metadata?.solution as string) || (item.metadata?.explanation as string) || '';
            const markingScheme: string[] = Array.isArray(item.metadata?.markingScheme) ? item.metadata.markingScheme : [];
            const isSolutionOpen = showSolutionsGlobal || !!expandedSolutions[item.id];

            return (
              <div key={item.id} className="pt-6 first:pt-0 space-y-3.5 break-inside-avoid">
                {/* Question Top Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 dark:text-white text-xs font-bold shadow-xs print:bg-black print:text-white">
                      Q{index + 1}
                    </span>
                    <div>
                      {item.chapter && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 print:text-slate-700">
                          <span>{item.chapter}</span>
                        </div>
                      )}
                      {item.concepts && item.concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5 print:hidden">
                          {item.concepts.map((c, i) => (
                            <span key={i} className="text-[10px] text-slate-400 font-mono">
                              #{c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 print:border-black print:text-black print:bg-transparent">
                      [{marks} {marks === 1 ? 'Mark' : 'Marks'}]
                    </span>

                    {/* Interactive Solution Toggle Button (hidden during print) */}
                    {solution && (
                      <button
                        type="button"
                        onClick={() => toggleSolution(item.id)}
                        className="print:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        {isSolutionOpen ? <EyeOff className="w-3 h-3 text-indigo-500" /> : <Eye className="w-3 h-3 text-indigo-500" />}
                        <span>{isSolutionOpen ? 'Hide Solution' : 'View Solution'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="pl-10 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                  <MarkdownRenderer content={item.body} />
                </div>

                {/* MCQ Options formatted in 2-Column Grid */}
                {options.length > 0 && (
                  <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm">
                    {options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/40 print:border-slate-400 print:bg-transparent"
                      >
                        <span className="font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex-shrink-0 print:bg-transparent print:text-black">
                          ({String.fromCharCode(65 + optIdx)})
                        </span>
                        <div className="flex-1 font-medium leading-relaxed">
                          <MarkdownRenderer content={opt} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Expandable Model Solution & Marking Scheme */}
                {isSolutionOpen && solution && (
                  <div className="ml-10 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 space-y-2 text-xs print:hidden animate-fadeIn">
                    <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Model Solution & Answer:
                      </span>
                      {typeof correctOptIdx === 'number' && options[correctOptIdx] && (
                        <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold">
                          Correct Option: ({String.fromCharCode(65 + correctOptIdx)})
                        </span>
                      )}
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 leading-relaxed pl-2 border-l-2 border-emerald-400">
                      <MarkdownRenderer content={solution} />
                    </div>

                    {markingScheme.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 space-y-1">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                          Examiner Marking Scheme:
                        </span>
                        <ul className="space-y-0.5 text-slate-700 dark:text-slate-300">
                          {markingScheme.map((scheme, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600">•</span>
                              <span>{scheme}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DETACHED ANSWER KEY & SOLUTION PAGE (FOR PRINTING / REVIEWS)   */}
      {/* ========================================================================= */}
      {config.includeAnswerKey && (
        <div className="pt-10 border-t-4 border-double border-slate-400 break-before-page page-break-before-always space-y-6 print:pt-0 print:border-t-0">
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-3 print:border-black">
            <span className="text-xs uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400 print:text-black">
              Examiner & Evaluator Resource Key
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white print:text-black">
              Comprehensive Solution Key & Step Marking Scheme
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700">
              Worksheet: {config.title || 'Technical Assessment'} • {items.length} Questions • {coverage.totalMarks} Total Marks
            </p>
          </div>

          <div className="space-y-6 divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300 text-xs sm:text-sm">
            {items.map((item, idx) => {
              const explanation = (item.metadata?.solution as string) || (item.metadata?.explanation as string) || '';
              const options: string[] = Array.isArray(item.metadata?.options) ? item.metadata.options : [];
              const correctOptIdx = item.metadata?.correctOptionIndex;
              const markingScheme: string[] = Array.isArray(item.metadata?.markingScheme) ? item.metadata.markingScheme : [];

              return (
                <div key={item.id} className="pt-4 first:pt-0 space-y-2 break-inside-avoid">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white print:text-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 print:text-black" />
                      Q{idx + 1} Solution & Evaluation Breakdown
                    </span>
                    {item.chapter && (
                      <span className="text-[11px] text-slate-500 font-medium font-mono">
                        {item.chapter}
                      </span>
                    )}
                  </div>

                  {typeof correctOptIdx === 'number' && options[correctOptIdx] && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 font-semibold text-emerald-900 dark:text-emerald-200 print:bg-slate-100 print:text-black print:border-black">
                      <span className="font-bold">Correct Option: </span>
                      <span>({String.fromCharCode(65 + correctOptIdx)}) {options[correctOptIdx]}</span>
                    </div>
                  )}

                  {explanation && (
                    <div className="pl-4 border-l-2 border-slate-300 dark:border-slate-700 space-y-1 print:border-slate-400">
                      <MarkdownRenderer content={explanation} />
                    </div>
                  )}

                  {markingScheme.length > 0 && (
                    <div className="pl-4 pt-1 space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                        Step Marking Criteria:
                      </span>
                      <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 print:text-black">
                        {markingScheme.map((scheme, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600">•</span>
                            <span>{scheme}</span>
                          </li>
                        ))}
                      </ul>
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
