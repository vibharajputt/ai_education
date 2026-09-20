import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ContentItem } from '@core/types';
import {
  explainItem,
  RateLimitError,
  GatewayError,
} from '@core/aiClient';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Skeleton } from '@components/Skeleton';
import { BottomSheet } from '@components/BottomSheet';
import {
  Sparkles,
  Languages,
  HelpCircle,
  MessageSquarePlus,
  RotateCcw,
  Send,
  Square,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Bot,
  User,
} from 'lucide-react';

export type AssistMode = 'simplify' | 'hindi' | 'why' | 'ask';

export interface AssistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: AssistMode;
  timestamp: number;
}

interface SolutionAssistantProps {
  item: ContentItem;
  questionNumber: number;
}

const MAX_TURNS = 6;
const getStorageKey = (itemId: string) => `split_view_assist_${itemId}`;

export function SolutionAssistant({ item, questionNumber }: SolutionAssistantProps) {
  // Stored thread history for this question
  const [messages, setMessages] = useState<AssistMessage[]>(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(item.id));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeMode, setActiveMode] = useState<AssistMode | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAskingInputOpen, setIsAskingInputOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamText, setCurrentStreamText] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Rate-limit state (429)
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  // Error state
  const [errorState, setErrorState] = useState<{
    message: string;
    code?: string;
    lastAction?: () => void;
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const skeletonTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // When question changes, abort active stream and load saved thread
  useEffect(() => {
    // Abort ongoing stream immediately when switching question
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (skeletonTimerRef.current) {
      clearTimeout(skeletonTimerRef.current);
    }
    setIsStreaming(false);
    setShowSkeleton(false);
    setCurrentStreamText('');
    setErrorState(null);
    setActiveMode(null);
    setIsAskingInputOpen(false);

    try {
      const saved = localStorage.getItem(getStorageKey(item.id));
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [item.id]);

  // Persist messages to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(item.id), JSON.stringify(messages));
    } catch {
      // Ignore storage quota or disabled storage
    }
  }, [messages, item.id]);

  // Turn countdown handler for 429 rate limit
  useEffect(() => {
    if (rateLimitSeconds !== null && rateLimitSeconds > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setRateLimitSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    }
  }, [rateLimitSeconds]);

  // Auto-scroll inside assistant panel when streaming
  useEffect(() => {
    if (isStreaming || currentStreamText) {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isStreaming, currentStreamText]);

  // Calculate turns (1 user query = 1 turn)
  const turnCount = messages.filter((m) => m.role === 'user').length;
  const isLimitReached = turnCount >= MAX_TURNS;

  // Clear thread
  const handleStartFreshThread = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setCurrentStreamText('');
    setIsStreaming(false);
    setShowSkeleton(false);
    setErrorState(null);
    localStorage.removeItem(getStorageKey(item.id));
  }, [item.id]);

  // Stop current stream
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setShowSkeleton(false);
    if (currentStreamText.trim()) {
      const assistantMsg: AssistMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: currentStreamText + '\n\n*(Stream stopped by student)*',
        mode: activeMode || undefined,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentStreamText('');
    }
  };

  // Main trigger assist handler
  const executeAssist = async (mode: AssistMode, userQueryText?: string) => {
    if (isLimitReached) return;
    if (rateLimitSeconds !== null && rateLimitSeconds > 0) return;

    // Reset errors and stop any active stream
    setErrorState(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const labelMap: Record<AssistMode, string> = {
      simplify: 'Explain simply',
      hindi: 'हिंदी में समझाइए (Explain in Hindi)',
      why: 'Why this specific formula/step?',
      ask: userQueryText || 'Can you elaborate on this concept?',
    };

    const userPrompt = userQueryText || labelMap[mode];

    // Add user message
    const userMsg: AssistMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      mode,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setActiveMode(mode);
    setCustomQuestion('');
    setIsAskingInputOpen(false);
    setCurrentStreamText('');

    // Skeleton trigger in under 150ms
    setShowSkeleton(false);
    skeletonTimerRef.current = setTimeout(() => {
      setShowSkeleton(true);
    }, 100);

    setIsStreaming(true);

    // Build history for backend
    const apiHistory = nextMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let accumulatedText = '';

    try {
      const stream = explainItem(
        {
          itemId: item.id,
          itemBody: item.body,
          mode,
          question: userQueryText,
          history: apiHistory,
        },
        abortController.signal,
      );

      for await (const chunk of stream) {
        if (abortController.signal.aborted) return;

        if (chunk.error) {
          throw new GatewayError(chunk.error.message, chunk.error.code);
        }

        if (chunk.delta) {
          if (skeletonTimerRef.current) {
            clearTimeout(skeletonTimerRef.current);
          }
          setShowSkeleton(false);
          accumulatedText += chunk.delta;
          setCurrentStreamText(accumulatedText);
        }

        if (chunk.done) {
          break;
        }
      }

      if (!abortController.signal.aborted && accumulatedText) {
        const assistantMsg: AssistMessage = {
          id: `assist-${Date.now()}`,
          role: 'assistant',
          content: accumulatedText,
          mode,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setCurrentStreamText('');
      }
    } catch (err: unknown) {
      if (abortController.signal.aborted) return;

      setShowSkeleton(false);
      setCurrentStreamText('');

      if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds || 60);
        setErrorState({
          message: `Too many questions in a short period. Please wait ${err.retryAfterSeconds}s before sending another request.`,
          code: 'RATE_LIMIT',
          lastAction: () => executeAssist(mode, userQueryText),
        });
      } else if (err instanceof GatewayError) {
        setErrorState({
          message: err.message,
          code: err.code,
          lastAction: () => executeAssist(mode, userQueryText),
        });
      } else {
        setErrorState({
          message: 'An unexpected connection error occurred. Please try again.',
          lastAction: () => executeAssist(mode, userQueryText),
        });
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsStreaming(false);
        setShowSkeleton(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isStreaming) return;
    executeAssist('ask', customQuestion.trim());
  };

  // Render assistant content body
  const renderAssistantContent = () => (
    <div className="space-y-4">
      {/* Turn Limit Notice */}
      <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
          <Bot className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Focused AI Assistant for Q{questionNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              turnCount >= 5 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-[var(--color-text-muted)]'
            }`}
          >
            Turn {turnCount} of {MAX_TURNS}
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleStartFreshThread}
              className="text-[11px] text-[var(--color-accent)] hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Thread
            </button>
          )}
        </div>
      </div>

      {/* 6-turn limit alert */}
      {isLimitReached && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            6-Turn Thread Limit Reached
          </div>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            To keep guidance strictly focused on Q{questionNumber}, each session allows up to 6 turns. Start a fresh thread to continue asking questions.
          </p>
          <button
            type="button"
            onClick={handleStartFreshThread}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Fresh Thread
          </button>
        </div>
      )}

      {/* Rate limit 429 banner */}
      {rateLimitSeconds !== null && rateLimitSeconds > 0 && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300">
            <Clock className="w-4 h-4 text-blue-500" />
            Rate Limit in Effect
          </div>
          <p className="text-[var(--color-text-muted)]">
            AI assistance is rate-limited to ensure fair usage. Resuming in{' '}
            <strong className="text-[var(--color-text)] font-mono">{rateLimitSeconds}s</strong>...
          </p>
          <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-1000"
              style={{ width: `${Math.max(0, (rateLimitSeconds / 60) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Gateway / Connection Error State */}
      {errorState && rateLimitSeconds === null && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            AI Assistant Notice
          </div>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            {errorState.message}
          </p>
          {errorState.lastAction && (
            <button
              type="button"
              onClick={errorState.lastAction}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Last Request
            </button>
          )}
        </div>
      )}

      {/* Message History */}
      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3.5 rounded-xl text-xs space-y-2 ${
              msg.role === 'user'
                ? 'bg-[var(--color-surface-subtle)] border border-[var(--color-border)] ml-6'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm mr-2'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1.5">
                {msg.role === 'user' ? (
                  <>
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>You</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>AI Solution Coach</span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-normal opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="text-[var(--color-text)] leading-relaxed prose dark:prose-invert max-w-none text-xs">
              <MarkdownRenderer content={msg.content} />
            </div>
          </div>
        ))}

        {/* Live Token-by-Token Streaming Message */}
        {isStreaming && currentStreamText && (
          <div className="p-3.5 rounded-xl text-xs space-y-2 bg-[var(--color-surface)] border border-[var(--color-accent)]/40 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-accent)]">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Generating Response...</span>
              </div>
              <button
                type="button"
                onClick={handleStopStream}
                className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-red-500/10"
              >
                <Square className="w-3 h-3" /> Stop
              </button>
            </div>

            <div className="text-[var(--color-text)] leading-relaxed prose dark:prose-invert max-w-none text-xs">
              <MarkdownRenderer content={currentStreamText} />
            </div>
          </div>
        )}

        {/* Skeleton displayed within <150ms before tokens arrive */}
        {showSkeleton && !currentStreamText && (
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2.5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-[var(--color-surface-subtle)] rounded w-32" />
              <button
                type="button"
                onClick={handleStopStream}
                className="text-[11px] text-red-500 flex items-center gap-1"
              >
                <Square className="w-3 h-3" /> Cancel
              </button>
            </div>
            <Skeleton lines={3} className="pt-2" />
          </div>
        )}

        <div ref={streamEndRef} />
      </div>

      {/* Inline Custom Question Form for mode='ask' */}
      {isAskingInputOpen && !isLimitReached && (
        <form onSubmit={handleCustomQuestionSubmit} className="space-y-2 pt-2 border-t border-[var(--color-border)]">
          <label className="block text-[11px] font-bold text-[var(--color-text-muted)]">
            Ask anything about Q{questionNumber}'s derivation or concepts:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g., Why did we take refractive index as 1.5 here?"
              disabled={isStreaming}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/60"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || isStreaming}
              className="px-3.5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              Ask
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
      {/* Top Section Header & Action Bar */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            Live AI Assistant & Clarification
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1"
              >
                {isPanelExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> View Thread ({messages.length})
                  </>
                )}
              </button>
            )}

            {/* Mobile Sheet Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(true)}
              className="md:hidden px-2.5 py-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Assistant
            </button>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
            onClick={() => executeAssist('simplify')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] disabled:opacity-40 transition-all shadow-sm active:scale-95 text-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Explain simply</span>
          </button>

          <button
            type="button"
            disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
            onClick={() => executeAssist('hindi')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] disabled:opacity-40 transition-all shadow-sm active:scale-95 text-center"
          >
            <Languages className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>हिंदी में</span>
          </button>

          <button
            type="button"
            disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
            onClick={() => executeAssist('why')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] disabled:opacity-40 transition-all shadow-sm active:scale-95 text-center"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Why this step?</span>
          </button>

          <button
            type="button"
            disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
            onClick={() => {
              setIsAskingInputOpen(true);
              setIsPanelExpanded(true);
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold disabled:opacity-40 transition-all shadow-sm active:scale-95 text-center ${
              isAskingInputOpen
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Ask something</span>
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Expandable Panel (>=768px) */}
      {(messages.length > 0 || isStreaming || showSkeleton || isAskingInputOpen || errorState) && isPanelExpanded && (
        <div className="hidden md:block p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
          {renderAssistantContent()}
        </div>
      )}

      {/* Mobile Bottom Sheet (<768px, 360px viewport friendly) */}
      <BottomSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        title={`AI Assistant • Q${questionNumber}`}
        maxHeight="82vh"
      >
        <div className="space-y-4 pb-6">
          {/* Action buttons inside mobile sheet */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
              onClick={() => executeAssist('simplify')}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Explain simply
            </button>
            <button
              type="button"
              disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
              onClick={() => executeAssist('hindi')}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
            >
              <Languages className="w-3.5 h-3.5 text-purple-500" />
              हिंदी में
            </button>
            <button
              type="button"
              disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
              onClick={() => executeAssist('why')}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              Why this step?
            </button>
            <button
              type="button"
              disabled={isStreaming || isLimitReached || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
              onClick={() => setIsAskingInputOpen(true)}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-500" />
              Ask question
            </button>
          </div>

          {renderAssistantContent()}
        </div>
      </BottomSheet>
    </div>
  );
}
