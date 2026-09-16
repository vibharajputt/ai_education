import React from 'react';

interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  label,
  className = '',
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center relative ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${clampedValue}% progress`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-[var(--color-border)]"
          fill="transparent"
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="stroke-[var(--color-accent)] transition-all duration-500 ease-out"
          fill="transparent"
        />
      </svg>
      {/* Center Label */}
      <span className="absolute text-xs font-semibold text-[var(--color-text)]">
        {Math.round(clampedValue)}%
      </span>
    </div>
  );
}
