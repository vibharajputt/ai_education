// src/modules/syllabus-plan/index.tsx
// Tier B Upload-Driven Syllabus to Study Plan Generator Module.

import React, { useState } from 'react';
import { UploadArtifactSection, UploadArtifactError } from '@components/UploadArtifactSection';
import { Badge } from '@components/Badge';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { syllabusPlanConfig } from './config';
import { extractResumeText } from '../resume-analyzer/utils/resumeParser';
import {
  parseSyllabusText,
  generateStudyPlan,
  SyllabusPlanResult,
} from './utils/syllabusScheduler';
import { CalendarPlanView } from './components/CalendarPlanView';

export const SyllabusPlanModule: React.FC = () => {
  // User Configuration Inputs: Target Deadline & Hours/Day
  const defaultDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [deadlineDate, setDeadlineDate] = useState<string>(defaultDeadline);
  const [hoursPerDay, setHoursPerDay] = useState<number>(3);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<UploadArtifactError | null>(null);
  const [studyPlan, setStudyPlan] = useState<SyllabusPlanResult | null>(null);

  const handleGeneratePlan = async (file: File | null, rawText: string | null) => {
    setIsGenerating(true);
    setErrorState(null);
    setStudyPlan(null);

    try {
      // 1. Extract text from uploaded syllabus document or raw text
      const syllabusText = await extractResumeText(file, rawText);

      // 2. Parse syllabus text into units & topics
      const units = parseSyllabusText(syllabusText);

      // 3. Generate Day-wise Study Schedule enforcing hours/day cap
      const plan = generateStudyPlan(units, deadlineDate, hoursPerDay);

      setStudyPlan(plan);
    } catch (err: any) {
      setErrorState({
        code: err.code || 'PARSE_ERROR',
        message: err.message || 'Failed to parse syllabus document. Please check file formatting.',
        isScannedPdf: err.isScannedPdf,
        isEmptyResume: err.isEmptyResume,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetError = () => {
    setErrorState(null);
  };

  const handleResetResult = () => {
    setStudyPlan(null);
    setErrorState(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Module Header with Mandatory scopeLabel per AGENTS.md */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[var(--color-accent)]" />
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
              {syllabusPlanConfig.title}
            </h1>
            <Badge label="Tier B • Syllabus Planner" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" />
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            {syllabusPlanConfig.description}
          </p>
        </div>

        {/* AGENTS.md Scope Badge */}
        <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          <span>Scope: {syllabusPlanConfig.scopeLabel}</span>
        </div>
      </div>

      {/* Main Shared Upload Workspace */}
      <UploadArtifactSection
        title="Upload Syllabus PDF or Paste Syllabus Text"
        subtitle="Upload your course syllabus or past-paper topic list to automatically parse study units and create a day-wise schedule capped by your available daily study hours."
        acceptTypes=".pdf,.docx,.txt"
        maxSizeBytes={5 * 1024 * 1024}
        secondaryInput={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Target Exam / Completion Deadline */}
            <div className="space-y-1.5">
              <label htmlFor="syllabus-deadline" className="block text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                Target Exam / Completion Deadline
              </label>
              <input
                id="syllabus-deadline"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold"
              />
            </div>

            {/* Daily Available Study Hours Cap */}
            <div className="space-y-1.5">
              <label htmlFor="syllabus-hours-per-day" className="block text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                Daily Available Study Limit (Hours / Day Cap)
              </label>
              <select
                id="syllabus-hours-per-day"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold"
              >
                <option value={1}>1 Hour / Day (Light Revision)</option>
                <option value={2}>2 Hours / Day (Moderate Pace)</option>
                <option value={3}>3 Hours / Day (Standard Study)</option>
                <option value={4}>4 Hours / Day (Intensive Prep)</option>
                <option value={6}>6 Hours / Day (Full-Day Bootcamp)</option>
              </select>
            </div>
          </div>
        }
        onAnalyze={handleGeneratePlan}
        isAnalyzing={isGenerating}
        error={errorState}
        onResetError={handleResetError}
        hasResult={Boolean(studyPlan)}
        onResetResult={handleResetResult}
      >
        {/* Generated Study Plan Result View */}
        {studyPlan && (
          <div className="animate-in fade-in duration-300">
            <CalendarPlanView plan={studyPlan} onUpdatePlan={(updated) => setStudyPlan(updated)} />
          </div>
        )}
      </UploadArtifactSection>
    </div>
  );
};
