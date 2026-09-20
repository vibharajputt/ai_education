import React, { useState, useEffect, useRef, useCallback } from 'react';
import { assistStreamItem, AssistRequest } from '@core/aiClient';
import { MarkdownRenderer } from '@components/MarkdownRenderer';
import { Skeleton } from '@components/Skeleton';
import { BottomSheet } from '@components/BottomSheet';
import {
  Sparkles,
  Languages,
  HelpCircle,
  MessageSquare,
  Send,
  RotateCcw,
  AlertTriangle,
  Clock,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ThreadMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LiveAssistPanelProps {
  itemId: string;
  isMobile?: boolean;
}

export const LiveAssistPanel: React.FC<LiveAssistPanelProps> = ({ itemId, isMobile = false }) => {
  const [thread, setThread] = useState<ThreadMessage[]>(() => {
    const saved = localStorage.getItem(`splitview_assist_thread_${itemId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeMode, setActiveMode] = useState<'simplify' | 'hindi' | 'why' | 'ask' | null>(null);
  const [askInput, setAskInput] = useState<string>('');
  const [showAskInput, setShowAskInput] = useState<boolean>(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isSkeleton, setIsSkeleton] = useState<boolean>(false);
  const [streamText, setStreamText] = useState<string>('');

  // Error States
  const [errorState, setErrorState] = useState<{
    code: string;
    message: string;
    retryAfter?: number;
  } | null>(null);

  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist thread to localStorage on changes
  useEffect(() => {
    localStorage.setItem(`splitview_assist_thread_${itemId}`, JSON.stringify(thread));
  }, [thread, itemId]);

  // Clean up streaming on unmount or itemId change
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [itemId]);

  // Rate Limit Countdown Timer
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          setErrorState(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  // Stream Trigger Function
  const handleStartAssist = useCallback(
    async (mode: 'simplify' | 'hindi' | 'why' | 'ask', customQuestion?: string) => {
      if (thread.length >= 12) {
        setErrorState({
          code: 'TURN_LIMIT_REACHED',
          message: 'Thread turn limit reached (6 of 6 turns). Please start a fresh thread.',
        });
        return;
      }

      // Abort previous stream if running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setActiveMode(mode);
      setErrorState(null);
      setIsStreaming(true);
      setIsSkeleton(true);
      setStreamText('');

      if (isMobile) setIsMobileSheetOpen(true);

      // Skeleton timer < 150ms
      const skeletonTimeout = setTimeout(() => {
        setIsSkeleton(false);
      }, 140);

      const userText = customQuestion || (mode === 'simplify' ? 'Explain simply' : mode === 'hindi' ? 'हिंदी में' : 'Why this step?');
      const updatedThread: ThreadMessage[] = [...thread, { role: 'user', content: userText }];
      setThread(updatedThread);

      const request: AssistRequest = {
        itemId,
        mode,
        question: customQuestion,
        history: updatedThread.slice(0, -1),
      };

      try {
        let accumulated = '';
        for await (const chunk of assistStreamItem(request, controller.signal)) {
          if (controller.signal.aborted) break;

          clearTimeout(skeletonTimeout);
          setIsSkeleton(false);

          if (chunk.error) {
            setErrorState({
              code: chunk.error.code,
              message: chunk.error.message,
              retryAfter: chunk.error.retryAfter,
            });
            if (chunk.error.retryAfter) {
              setRetryCountdown(chunk.error.retryAfter);
            }
            setIsStreaming(false);
            setThread((prev) => (prev.length > 0 && prev[prev.length - 1].role === 'user' ? prev.slice(0, -1) : prev));
            return;
          }

          accumulated += chunk.delta;
          setStreamText(accumulated);

          if (chunk.done) {
            setIsStreaming(false);
            setThread((prev) => [...prev, { role: 'assistant', content: accumulated }]);
            setStreamText('');
            return;
          }
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setErrorState({
            code: 'NETWORK_ERROR',
            message: 'Network connection interrupted. Click retry to resume.',
          });
          setIsStreaming(false);
        }
      } finally {
        clearTimeout(skeletonTimeout);
        setIsSkeleton(false);
      }
    },
    [thread, itemId, isMobile]
  );

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsSkeleton(false);
  };

  const handleClearThread = () => {
    handleStopStream();
    setThread([]);
    setErrorState(null);
    setStreamText('');
    localStorage.removeItem(`splitview_assist_thread_${itemId}`);
  };

  const turnCount = Math.floor(thread.length / 2);
  const isTurnLimit = turnCount >= 6;

  // Render Inner Assist Panel Content
  const renderPanelContent = () => (
    <div className="space-y-3">
      {/* Turn Counter & Header Controls */}
      <div className="flex items-center justify-between text-xs border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="font-bold text-[var(--color-text)]">Live Assistant Thread</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] border text-[11px] font-semibold text-[var(--color-text-muted)]">
            Turn {turnCount} of 6
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming && (
            <button
              type="button"
              onClick={handleStopStream}
              className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1"
            >
              <Square className="w-3 h-3" /> Stop
            </button>
          )}

          {thread.length > 0 && (
            <button
              type="button"
              onClick={handleClearThread}
              className="text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-rose-500 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Fresh Thread
            </button>
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsPanelExpanded((prev) => !prev)}
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              {isPanelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isPanelExpanded && (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {/* Action Bar Under Solution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              disabled={isStreaming || isTurnLimit}
              onClick={() => handleStartAssist('simplify')}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)]/10 text-[var(--color-text)] font-semibold text-xs border border-[var(--color-border)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Explain simply
            </button>

            <button
              type="button"
              disabled={isStreaming || isTurnLimit}
              onClick={() => handleStartAssist('hindi')}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)]/10 text-[var(--color-text)] font-semibold text-xs border border-[var(--color-border)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Languages className="w-3.5 h-3.5 text-sky-500" /> हिंदी में
            </button>

            <button
              type="button"
              disabled={isStreaming || isTurnLimit}
              onClick={() => handleStartAssist('why')}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)]/10 text-[var(--color-text)] font-semibold text-xs border border-[var(--color-border)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" /> Why this step?
            </button>

            <button
              type="button"
              disabled={isStreaming || isTurnLimit}
              onClick={() => setShowAskInput((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)]/10 text-[var(--color-text)] font-semibold text-xs border border-[var(--color-border)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> Ask something
            </button>
          </div>

          {/* Ask Custom Question Input Bar */}
          {showAskInput && !isTurnLimit && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (askInput.trim()) {
                  handleStartAssist('ask', askInput.trim());
                  setAskInput('');
                  setShowAskInput(false);
                }
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                placeholder="Type your specific question about this step..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <button
                type="submit"
                disabled={!askInput.trim() || isStreaming}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          )}

          {/* Turn Limit Warning */}
          {isTurnLimit && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-[var(--color-text)] flex items-center justify-between">
              <span className="font-semibold">Turn limit reached (6 of 6 turns).</span>
              <button
                type="button"
                onClick={handleClearThread}
                className="px-2.5 py-1 rounded-md bg-[var(--color-accent)] text-white font-bold text-[11px]"
              >
                Start Fresh Thread
              </button>
            </div>
          )}

          {/* Error State Banner */}
          {errorState && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorState.code === 'RATE_LIMIT_EXCEEDED' ? 'Rate Limit Reached' : 'Assistant Error'}</span>
              </div>
              <p className="text-[var(--color-text)] font-medium leading-relaxed">
                {errorState.message}
              </p>

              {retryCountdown > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold pt-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Retry available in {retryCountdown}s...
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartAssist(activeMode || 'simplify')}
                  className="px-3 py-1 rounded-md bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors"
                >
                  Retry Request
                </button>
              )}
            </div>
          )}

          {/* Skeleton < 150ms */}
          {isSkeleton && (
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          )}

          {/* Conversation History Thread */}
          {thread.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                msg.role === 'user'
                  ? 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text)] font-semibold ml-4'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] mr-2'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <MarkdownRenderer content={msg.content} />
            </div>
          ))}

          {/* Active Token Stream Output */}
          {isStreaming && streamText && (
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-accent)] text-xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" /> Streaming response...
              </div>
              <MarkdownRenderer content={streamText} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Action Bar trigger */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleStartAssist('simplify')}
            className="p-2 rounded-lg bg-[var(--color-surface-subtle)] border text-xs font-bold text-[var(--color-text)] flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Explain simply
          </button>
          <button
            type="button"
            onClick={() => handleStartAssist('hindi')}
            className="p-2 rounded-lg bg-[var(--color-surface-subtle)] border text-xs font-bold text-[var(--color-text)] flex items-center justify-center gap-1"
          >
            <Languages className="w-3.5 h-3.5 text-sky-500" /> हिंदी में
          </button>
        </div>

        {/* Mobile Bottom Sheet */}
        <BottomSheet
          isOpen={isMobileSheetOpen}
          onClose={() => {
            handleStopStream();
            setIsMobileSheetOpen(false);
          }}
          title="AI Live Assistant"
        >
          {renderPanelContent()}
        </BottomSheet>
      </>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      {renderPanelContent()}
    </div>
  );
};
