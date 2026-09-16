import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section' | 'li';
  /** Additional aria label for interactive cards */
  'aria-label'?: string;
}

export function Card({
  children,
  className = '',
  onClick,
  as: Tag = 'div',
  'aria-label': ariaLabel,
}: CardProps) {
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:border-line-strong hover:shadow-sm transition-shadow duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
    : '';

  return (
    <Tag
      className={`bg-surface border border-line rounded-md p-4 ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
