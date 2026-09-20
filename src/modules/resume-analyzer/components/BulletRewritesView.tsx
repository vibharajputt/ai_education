// src/modules/resume-analyzer/components/BulletRewritesView.tsx
// Before/After bullet point diff view with copy-to-clipboard functionality.

import React, { useState } from 'react';
import { Card } from '@components/Card';
import { Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { BulletRewrite } from '../utils/resumeParser';

interface BulletRewritesViewProps {
  rewrites: BulletRewrite[];
}

export const BulletRewritesView: React.FC<BulletRewritesViewProps> = ({ rewrites }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">High-Impact Bullet Point Rewrites</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Before & after optimization comparison with 1-click copy.
          </p>
        </div>
        <span className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> {rewrites.length} Rewrite{rewrites.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-4">
        {rewrites.map((rewrite, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              {/* Original Bullet (Before) */}
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  BEFORE (Original Bullet):
                </div>
                <p className="text-[var(--color-text)] font-mono text-[11px] leading-relaxed line-through opacity-85">
                  "{rewrite.original}"
                </p>
              </div>

              {/* Improved Bullet (After) */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 relative group">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> AFTER (ATS Optimized):
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(rewrite.improved, idx)}
                    className="px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors flex items-center gap-1 shadow-xs"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[var(--color-accent)]" /> Copy Bullet
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[var(--color-text)] font-semibold text-[11px] leading-relaxed pt-1">
                  "{rewrite.improved}"
                </p>
              </div>
            </div>

            {/* Why This Improves Impact */}
            <div className="text-[11px] text-[var(--color-text-muted)] italic flex items-center gap-1.5 pt-1">
              <span className="font-bold non-italic text-[var(--color-accent)]">Rationale:</span>
              <span>{rewrite.why}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
