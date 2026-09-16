import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div
      className={`prose dark:prose-invert max-w-none text-[var(--color-text)] prose-headings:text-[var(--color-text)] prose-p:leading-relaxed prose-code:text-[var(--color-accent)] prose-code:font-mono prose-code:text-sm prose-pre:bg-[var(--color-surface)] prose-pre:border prose-pre:border-[var(--color-border)] ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
