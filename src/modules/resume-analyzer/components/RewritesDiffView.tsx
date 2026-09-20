import React, { useState } from 'react';
import type { ResumeRewrite } from '../types';
import { Copy, Check, Sparkles, CornerDownRight } from 'lucide-react';

interface RewritesDiffViewProps {
  rewrites: ResumeRewrite[];
}

export function RewritesDiffView({ rewrites }: RewritesDiffViewProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          High-Impact Bullet Point Rewrites ({rewrites.length})
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          Side-by-side before and after comparisons with quantified metrics and XYZ-formula structuring.
        </p>
      </div>

      <div className="space-y-4">
        {rewrites.map((rw, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-red-500/5 border border-red-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-red-400">
                  <span>BEFORE (ORIGINAL)</span>
                  <span className="text-[10px] font-normal opacity-80">Passive / Unquantified</span>
                </div>
                <p className="text-xs text-[var(--color-text)] leading-relaxed font-mono">
                  "{rw.original}"
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 relative group">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>AFTER (HIGH IMPACT REWRITE)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(rw.improved, idx)}
                    className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Rewrite
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text)] leading-relaxed font-mono font-medium">
                  "{rw.improved}"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              <CornerDownRight className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[var(--color-text)]">Rationale: </strong>
                {rw.why}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
