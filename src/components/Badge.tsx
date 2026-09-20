import type { ContentKind, Difficulty, Track } from '@core/types';
import type { ModuleTier } from '@core/registry';

type BadgeVariant =
  | 'kind'
  | 'difficulty'
  | 'tier'
  | 'track'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'accent'
  | 'default';

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// ---------------------------------------------------------------------------
// Colour maps — all use specific Tailwind palette classes so PurgeCSS/JIT
// keeps them. Dark-mode variants use the [data-theme="dark"] selector
// configured in tailwind.config.js.
// ---------------------------------------------------------------------------

const kindClasses: Record<ContentKind, string> = {
  'question':    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'concept':     'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'mnemonic':    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'viva':        'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'interview-q': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'tip':         'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
};

const difficultyClasses: Record<Difficulty, string> = {
  easy:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  hard:   'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const tierClasses: Record<ModuleTier, string> = {
  A: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  B: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  C: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
};

const trackClasses: Record<Track, string> = {
  school:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  college: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
};

function resolveClasses(variant: BadgeVariant, label: string): string {
  switch (variant) {
    case 'kind':
      return kindClasses[label as ContentKind] ?? '';
    case 'difficulty':
      return difficultyClasses[label as Difficulty] ?? '';
    case 'tier':
      return tierClasses[label as ModuleTier] ?? '';
    case 'track':
      return trackClasses[label as Track] ?? '';
    case 'success':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'warning':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'danger':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    case 'neutral':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    case 'accent':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
    default:
      return 'bg-surface-raised text-ink-muted';
  }
}

export function Badge({ label, children, variant = 'default', className = '' }: BadgeProps) {
  const text = label ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : '');
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium leading-tight ${resolveClasses(variant, text)} ${className}`}
    >
      {children ?? label}
    </span>
  );
}
