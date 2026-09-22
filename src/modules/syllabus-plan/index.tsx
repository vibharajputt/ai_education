import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DocumentUploadZone, type DocumentUploadResult } from '@components/DocumentUploadZone';
import type { SyllabusUnit, SyllabusPlanResult } from './types';
import { extractSyllabusUnitsFromText, generateStudyPlan } from './services/planEngine';
import { CalendarScheduleView } from './components/CalendarScheduleView';
import { ListScheduleView } from './components/ListScheduleView';
import {
  Calendar,
  RotateCcw,
  Sparkles,
  Sliders,
  ListOrdered,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';

const LS_COMPLETED_KEY = 'syllabus_plan_completed_tasks_v1';
const LS_CURRENT_PLAN = 'syllabus_plan_current_v1';

export function SyllabusPlanModule() {
  const [stage, setStage] = useState<'upload' | 'parameters' | 'schedule'>('upload');
  const [searchParams] = useSearchParams();
  const focusConcept = searchParams.get('focus');
  const [goal, setGoal] = useState(
    focusConcept ? `Master ${focusConcept} before board exams` : 'CBSE Board Exam Mastery & Full Syllabus Revision'
  );

  // Update goal if focus param changes (e.g. navigating from SWOT with different concept)
  useEffect(() => {
    if (focusConcept) {
      setGoal(`Master ${focusConcept} before board exams`);
    }
  }, [focusConcept]);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [units, setUnits] = useState<SyllabusUnit[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LS_COMPLETED_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [planResult, setPlanResult] = useState<SyllabusPlanResult | null>(() => {
    try {
      const saved = localStorage.getItem(LS_CURRENT_PLAN);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (planResult && stage === 'upload') {
      setStage('schedule');
    }
  }, [planResult, stage]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_COMPLETED_KEY, JSON.stringify(Array.from(completedBlocks)));
    } catch {
      // Ignore
    }
  }, [completedBlocks]);

  const handleDocumentReady = (doc: DocumentUploadResult) => {
    const text = doc.text || 'Chapter 1: Chemical Reactions\nChapter 2: Acids and Bases\nChapter 3: Metals\nChapter 4: Carbon Compounds\nChapter 5: Life Processes\nChapter 6: Control and Coordination\nChapter 7: Reproduction\nChapter 8: Heredity\nChapter 9: Light Reflection\nChapter 10: Human Eye\nChapter 11: Electricity';
    const parsedUnits = extractSyllabusUnitsFromText(text);
    setUnits(parsedUnits);
    setStage('parameters');
  };

  const handleGeneratePlan = () => {
    const result = generateStudyPlan(goal, deadline, hoursPerDay, units, completedBlocks);
    setPlanResult(result);
    localStorage.setItem(LS_CURRENT_PLAN, JSON.stringify(result));
    setStage('schedule');
  };

  const handleToggleBlock = (blockId: string) => {
    setCompletedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });

    if (planResult) {
      const updatedDays = planResult.days.map((d) => ({
        ...d,
        blocks: d.blocks.map((b) =>
          b.id === blockId ? { ...b, completed: !b.completed } : b
        ),
      }));
      const updated = { ...planResult, days: updatedDays };
      setPlanResult(updated);
      localStorage.setItem(LS_CURRENT_PLAN, JSON.stringify(updated));
    }
  };

  const handleReplan = () => {
    if (!planResult) return;
    const recalculated = generateStudyPlan(
      planResult.goal,
      planResult.deadline,
      planResult.hoursPerDay,
      planResult.units,
      completedBlocks
    );
    setPlanResult(recalculated);
    localStorage.setItem(LS_CURRENT_PLAN, JSON.stringify(recalculated));
  };

  const handleReset = () => {
    localStorage.removeItem(LS_CURRENT_PLAN);
    setPlanResult(null);
    setStage('upload');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-accent)] text-white shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
              AI Syllabus Parser & Adaptive Study Planner
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            2 Curated Prep Roadmaps and Study Protocols — Class 10/12 • Strict Time Feasibility Guaranteed
          </p>
        </div>

        {stage === 'schedule' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-sm hover:bg-amber-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-Plan Missed Days
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            >
              New Syllabus
            </button>
          </div>
        )}
      </div>

      {stage === 'upload' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                1. Upload Syllabus PDF / DOCX or Paste Curriculum Outline
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Automatically deconstructs chapters, topics, and estimated workload.
              </p>
            </div>

            <DocumentUploadZone
              onDocumentReady={handleDocumentReady}
              placeholderText="Paste syllabus topics, chapters, or textbook index here (e.g. 'Chapter 1: Chemical Reactions, Chapter 2: Electricity, Chapter 3: Optics...')"
              acceptLabel="Syllabus PDF or DOCX (max 5MB)"
            />
          </div>
        </div>
      )}

      {stage === 'parameters' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                2. Set Schedule Parameters & Topic Diagnostic Mastery
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Configure your target deadline and daily available hours. Hard invariant: daily hours will never exceed your limit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--color-text)]">Target Exam Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--color-text)]">
                  Daily Available Study Time ({hoursPerDay}h/day = {hoursPerDay * 60}m)
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-[var(--color-accent)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--color-text)]">Study Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[var(--color-accent)]" />
                  Extracted Syllabus Units ({units.length}) — Tune Current Mastery
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {units.map((u, idx) => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--color-text)] truncate">{u.name}</span>
                      <span className="text-[var(--color-accent)] font-mono">{u.currentMastery}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--color-text-muted)]">Weak</span>
                      <input
                        type="range"
                        min={10}
                        max={95}
                        step={5}
                        value={u.currentMastery}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setUnits((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, currentMastery: val } : item))
                          );
                        }}
                        className="flex-1 accent-[var(--color-accent)] h-1.5"
                      />
                      <span className="text-[10px] text-[var(--color-text-muted)]">Mastered</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGeneratePlan}
              className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Generate Adaptive Study Roadmap
            </button>
          </div>
        </div>
      )}

      {stage === 'schedule' && planResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar View ({planResult.days.length} Days)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                List / Checklist View
              </button>
            </div>

            <div className="text-xs text-[var(--color-text-muted)] hidden sm:block font-mono">
              Cap: {planResult.hoursPerDay}h/day • Target: {planResult.deadline}
            </div>
          </div>

          {planResult.dropped && planResult.dropped.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Explicitly De-prioritized Units ({planResult.dropped.length})
              </div>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                To guarantee daily time limits are not exceeded, the following units were dropped with pedagogic reasons:
              </p>
              <ul className="space-y-1 pl-4 list-disc text-[11px] text-[var(--color-text)]">
                {planResult.dropped.map((d, i) => (
                  <li key={i}>
                    <strong>{d.unit}:</strong> {d.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {viewMode === 'calendar' ? (
            <CalendarScheduleView
              days={planResult.days}
              onToggleBlock={handleToggleBlock}
            />
          ) : (
            <ListScheduleView
              days={planResult.days}
              onToggleBlock={handleToggleBlock}
            />
          )}
        </div>
      )}
    </div>
  );
}
