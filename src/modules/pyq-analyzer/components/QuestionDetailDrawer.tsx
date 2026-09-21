import React, { useState } from 'react';
import type { ContentItem } from '@core/types';
import { getItemYear, getItemMarks } from '../types';
import { Drawer } from '@components/Drawer';
import { Badge } from '@components/Badge';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import {
  generateGeminiSolution,
  type GeminiExplainMode,
} from '@core/geminiService';
import {
  Calendar,
  Award,
  BookOpen,
  Tag,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Bot,
  Send,
  Layers,
  HelpCircle,
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
  const [activeExplainTab, setActiveExplainTab] = useState<
    'blueprint' | 'hinglish' | 'example' | 'steps' | 'pitfalls'
  >('blueprint');
  const [aiExplanationsCache, setAiExplanationsCache] = useState<
    Record<string, string>
  >({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Doubt Box State
  const [doubtMessages, setDoubtMessages] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([]);
  const [doubtInput, setDoubtInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

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

  const handleSelectTab = async (
    tab: 'blueprint' | 'hinglish' | 'example' | 'steps' | 'pitfalls'
  ) => {
    setActiveExplainTab(tab);
    if (tab === 'blueprint' || !item) return;

    const cacheKey = `${item.id}_${tab}`;
    if (aiExplanationsCache[cacheKey]) return;

    setIsLoadingAi(true);
    try {
      const res = await generateGeminiSolution({
        questionText: item.body + (item.latex ? `\nLaTeX: ${item.latex}` : ''),
        subject: item.subject || 'General Science',
        chapter: item.chapter || 'Board Concepts',
        marks: itemMarks,
        mode: tab as GeminiExplainMode,
      });
      setAiExplanationsCache((prev) => ({ ...prev, [cacheKey]: res }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSendDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim() || !item || isAiTyping) return;

    const text = doubtInput.trim();
    setDoubtMessages((prev) => [...prev, { sender: 'user', text }]);
    setDoubtInput('');
    setIsAiTyping(true);

    try {
      let mode: GeminiExplainMode = 'ask';
      if (text.toLowerCase().includes('hinglish')) mode = 'hinglish';
      else if (text.toLowerCase().includes('example')) mode = 'example';

      const res = await generateGeminiSolution({
        questionText: item.body + (item.latex ? `\nLaTeX: ${item.latex}` : ''),
        subject: item.subject || 'General Science',
        chapter: item.chapter || 'Board Concepts',
        marks: itemMarks,
        mode,
        userPrompt: text,
      });
      setDoubtMessages((prev) => [...prev, { sender: 'ai', text: res }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleQuickDoubt = async (quickText: string) => {
    if (!item || isAiTyping) return;
    setDoubtMessages((prev) => [...prev, { sender: 'user', text: quickText }]);
    setIsAiTyping(true);

    try {
      let mode: GeminiExplainMode = 'ask';
      if (quickText.toLowerCase().includes('hinglish')) mode = 'hinglish';
      else if (quickText.toLowerCase().includes('example')) mode = 'example';
      else if (quickText.toLowerCase().includes('mistake')) mode = 'pitfalls';
      else if (quickText.toLowerCase().includes('step')) mode = 'steps';

      const res = await generateGeminiSolution({
        questionText: item.body + (item.latex ? `\nLaTeX: ${item.latex}` : ''),
        subject: item.subject || 'General Science',
        chapter: item.chapter || 'Board Concepts',
        marks: itemMarks,
        mode,
        userPrompt: quickText,
      });
      setDoubtMessages((prev) => [...prev, { sender: 'ai', text: res }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiTyping(false);
    }
  };

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

        {/* AI Explanation Mode Switcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              AI Explanations & Solution Modes
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">
              Powered by Google AI
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectTab('blueprint')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeExplainTab === 'blueprint'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marking Blueprint</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('hinglish')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeExplainTab === 'hinglish'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span>🇮🇳 Hinglish me Samjhao</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('example')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeExplainTab === 'example'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span>💡 Real-World Example</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('steps')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeExplainTab === 'steps'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Step Breakdown</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('pitfalls')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeExplainTab === 'pitfalls'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Examiner Traps</span>
            </button>
          </div>

          {/* Dynamic AI Mode Output Card */}
          {activeExplainTab !== 'blueprint' ? (
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border-2 border-indigo-500/30 space-y-2.5">
              {isLoadingAi ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                    Generating explanation for {item.chapter}...
                  </p>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed prose dark:prose-invert max-w-none">
                  <MarkdownRenderer
                    content={
                      aiExplanationsCache[`${item.id}_${activeExplainTab}`] ||
                      'Generating solution...'
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            /* Official CBSE Marking Blueprint */
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
          )}
        </div>

        {/* Ask AI Doubt Section */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-500" />
              Ask AI Doubt on this PYQ
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Instant clarification
            </span>
          </div>

          {doubtMessages.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              {doubtMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 text-xs ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
                    }`}
                  >
                    <MarkdownRenderer content={msg.text} />
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin text-blue-500" />
                  <span>AI is solving your doubt...</span>
                </div>
              )}
            </div>
          )}

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              '🇮🇳 Hinglish me samjhao',
              '💡 Example se samjhao',
              '⚠️ Common mistakes kya hoti h?',
              '📝 Step marks kaise milenge?',
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isAiTyping}
                onClick={() => handleQuickDoubt(chip)}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendDoubt} className="flex gap-2">
            <input
              type="text"
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              placeholder="Ask anything about this PYQ (e.g. why is this formula used?)..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!doubtInput.trim() || isAiTyping}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center"
            >
              {isAiTyping ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Sibling Questions */}
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
