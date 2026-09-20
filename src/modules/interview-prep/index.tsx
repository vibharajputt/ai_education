import React, { useState, useMemo } from 'react';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import {
  StateShell,
  Card,
  Badge,
  MarkdownRenderer,
  StatTile,
  UploadArtifactSection,
} from '../../components';
import { extractResumeText } from '../resume-analyzer/utils/resumeParser';
import {
  Briefcase,
  Code2,
  Database,
  BarChart,
  UserCheck,
  Lightbulb,
  FileText,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface StarFramework {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export const InterviewPrepModule: React.FC = () => {
  const { collection, items, loading, error } = useCollection('interview-prep.json');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const roles = useMemo(() => ['all', 'SDE', 'Data Science', 'Analyst', 'Behavioral (STAR)'], []);

  // Data Flow 3: Read skill gap from URL search params
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const targetSkill = params.get('skill');
        if (targetSkill) {
          setExtractedKeywords([targetSkill]);
        }
      }
    }
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item: ContentItem) => {
      const role = item.metadata?.role as string | undefined;
      const matchRole = selectedRole === 'all' || role === selectedRole;
      const matchDiff = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;

      let matchResume = true;
      if (extractedKeywords.length > 0) {
        const itemText = (
          item.body +
          ' ' +
          (item.subject || '') +
          ' ' +
          (item.chapter || '') +
          ' ' +
          (item.tags ? item.tags.join(' ') : '')
        ).toLowerCase();
        matchResume = extractedKeywords.some((kw) => itemText.includes(kw.toLowerCase()));
      }

      return matchRole && matchDiff && matchResume;
    });
  }, [items, selectedRole, selectedDifficulty, extractedKeywords]);

  if (loading || error || !collection) {
    return (
      <StateShell
        status={loading ? 'loading' : error ? 'error' : 'empty'}
        error={error}
      />
    );
  }

  const toggleAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResumeSubmit = async (file: File | null, pastedText: string | null) => {
    setIsParsingResume(true);
    setResumeError(null);
    try {
      const text = await extractResumeText(file, pastedText);
      setResumeText(text);

      const lower = text.toLowerCase();
      const detected = [
        'react',
        'node',
        'python',
        'sql',
        'java',
        'data',
        'analytics',
        'system design',
        'caching',
        'ml',
        'machine learning',
        'star',
        'behavioral',
      ].filter((kw) => lower.includes(kw));

      setExtractedKeywords(detected.length > 0 ? detected : ['sde', 'data']);
    } catch (err: any) {
      setResumeError(err?.message || 'Failed to parse resume text.');
    } finally {
      setIsParsingResume(false);
    }
  };

  const sdeCount = items.filter((i) => i.metadata?.role === 'SDE').length;
  const dataCount = items.filter((i) => i.metadata?.role === 'Data Science').length;
  const analystCount = items.filter((i) => i.metadata?.role === 'Analyst').length;
  const starCount = items.filter((i) => i.metadata?.role === 'Behavioral (STAR)').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-sky-900/30 to-background border border-blue-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label="B" variant="tier" />
              <Badge label="college" variant="track" />
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
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Briefcase className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Role Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatTile label="SDE Engineering" value={sdeCount} icon={<Code2 className="w-4 h-4 text-blue-400" />} />
          <StatTile label="Data Science" value={dataCount} icon={<Database className="w-4 h-4 text-indigo-400" />} />
          <StatTile label="Business Analytics" value={analystCount} icon={<BarChart className="w-4 h-4 text-sky-400" />} />
          <StatTile label="STAR Behavioral" value={starCount} icon={<UserCheck className="w-4 h-4 text-emerald-400" />} />
        </div>
      </div>

      {/* Resume Question Generator Section */}
      <Card className="p-5 space-y-4 border-blue-500/30 bg-blue-950/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-[var(--color-text)]">
            Tailor Questions from My Resume
          </h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Upload your resume PDF/DOCX or paste text below to filter and generate target interview questions matching your background.
        </p>

        <UploadArtifactSection
          title="Upload Resume or Paste Text"
          subtitle="Supports PDF, DOCX, TXT binary parsing"
          onAnalyze={handleResumeSubmit}
          isAnalyzing={isParsingResume}
          error={resumeError ? { code: 'PARSE_ERR', message: resumeError } : null}
          onResetError={() => setResumeError(null)}
          hasResult={extractedKeywords.length > 0}
          onResetResult={() => {
            setExtractedKeywords([]);
            setResumeText(null);
          }}
        />

        {extractedKeywords.length > 0 && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-[var(--color-text)] font-medium">
                Detected Resume Skills & Topics:
              </span>
              <div className="flex gap-1 flex-wrap">
                {extractedKeywords.map((kw: string) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setExtractedKeywords([]);
                setResumeText(null);
              }}
              className="text-xs text-rose-400 hover:underline font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
      </Card>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto">
        {[
          { id: 'all', label: `All Roles (${items.length})` },
          { id: 'SDE', label: `SDE (${sdeCount})` },
          { id: 'Data Science', label: `Data Science (${dataCount})` },
          { id: 'Analyst', label: `Analyst (${analystCount})` },
          { id: 'Behavioral (STAR)', label: `STAR Behavioral (${starCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedRole(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              selectedRole === tab.id
                ? 'bg-blue-500 text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Options */}
      <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs">
        <span className="text-[var(--color-text-muted)] font-medium">
          Showing {filteredItems.length} questions
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">Difficulty:</span>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {diff.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Question Bank Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm">
            No interview questions match the active filters.
          </div>
        ) : (
          filteredItems.map((item: ContentItem, idx: number) => {
            const isRevealed = revealedAnswers[item.id];
            const role = item.metadata?.role as string | undefined;
            const category = item.metadata?.category as string | undefined;
            const modelAnswer = item.metadata?.modelAnswer as string | undefined;
            const star = item.metadata?.starFramework as StarFramework | null | undefined;

            return (
              <Card key={item.id} className="p-5 space-y-4 hover:border-blue-500/30 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      Q{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {role || 'Interview'}
                    </span>
                    {category && (
                      <span className="px-2 py-0.5 text-xs font-mono rounded bg-[var(--color-surface-subtle)] border text-[var(--color-text-muted)]">
                        {category}
                      </span>
                    )}
                    <Badge label={item.difficulty || 'medium'} variant="difficulty" />
                  </div>

                  {item.concepts && item.concepts.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.concepts.map((c: string) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 text-[10px] rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <div className="text-sm font-semibold text-[var(--color-text)] leading-relaxed">
                  <MarkdownRenderer content={item.body} />
                </div>

                {/* Action Button */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => toggleAnswer(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {isRevealed ? 'Hide Model Answer' : 'View Model Answer & Framework'}
                  </button>
                </div>

                {/* Reveal Model Answer / STAR Breakdown */}
                {isRevealed && (
                  <div className="space-y-3 pt-2">
                    {/* Model Answer */}
                    {modelAnswer && (
                      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs md:text-sm space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                          <span>Model Answer:</span>
                        </div>
                        <div className="text-[var(--color-text-muted)] leading-relaxed font-sans">
                          <MarkdownRenderer content={modelAnswer} />
                        </div>
                      </div>
                    )}

                    {/* STAR Framework Breakdown (if behavioral) */}
                    {star && (
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-3">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-sm">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>STAR Method Response Structure:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-400 block">S — Situation</span>
                            <p className="text-[var(--color-text-muted)]">{star.situation}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-400 block">T — Task</span>
                            <p className="text-[var(--color-text-muted)]">{star.task}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-400 block">A — Action</span>
                            <p className="text-[var(--color-text-muted)]">{star.action}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-400 block">R — Result</span>
                            <p className="text-[var(--color-text-muted)]">{star.result}</p>
                          </div>
                        </div>
                      </div>
                    )}
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
