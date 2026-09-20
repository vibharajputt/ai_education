import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialRatio?: number; // 0 to 1, default 0.5
  ratio?: number; // controlled ratio
  onRatioChange?: (ratio: number) => void;
  minRatio?: number;
  maxRatio?: number;
  className?: string;
}

export function SplitPane({
  left,
  right,
  initialRatio = 0.5,
  ratio: controlledRatio,
  onRatioChange,
  minRatio = 0.25,
  maxRatio = 0.75,
  className = '',
}: SplitPaneProps) {
  const [internalRatio, setInternalRatio] = useState(initialRatio);
  const ratio = controlledRatio !== undefined ? controlledRatio : internalRatio;
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - rect.left) / rect.width;
      if (newRatio >= minRatio && newRatio <= maxRatio) {
        setInternalRatio(newRatio);
        onRatioChange?.(newRatio);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minRatio, maxRatio]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col md:flex-row w-full h-full min-h-0 overflow-hidden ${
        isDragging ? 'select-none cursor-col-resize' : ''
      } ${className}`}
    >
      {/* Left / Top pane */}
      <div
        className="w-full md:h-full overflow-auto"
        style={{ flexBasis: `${ratio * 100}%` }}
      >
        {left}
      </div>

      {/* Resizer divider (visible on desktop) */}
      <div
        onMouseDown={startDragging}
        className="hidden md:flex w-1.5 hover:w-2 bg-[var(--color-border)] hover:bg-[var(--color-accent)] cursor-col-resize transition-all duration-150 items-center justify-center shrink-0 z-10"
        role="separator"
        aria-orientation="vertical"
      />

      {/* Right / Bottom pane */}
      <div
        className="w-full md:h-full overflow-auto flex-1"
        style={{ flexBasis: `${(1 - ratio) * 100}%` }}
      >
        {right}
      </div>
    </div>
  );
}
