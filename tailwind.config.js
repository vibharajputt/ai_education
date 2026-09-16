import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Dark mode: triggered by data-theme="dark" on <html>
  // useTheme hook always writes an explicit attribute, so CSS media query is not needed.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      lineHeight: {
        reading: '1.75',
      },
      // Semantic color tokens backed by CSS custom properties (defined in theme.css).
      // Opacity modifiers (e.g. bg-accent/50) are not supported with CSS variables.
      colors: {
        canvas:          'var(--color-bg)',
        surface:         'var(--color-surface)',
        'surface-raised':'var(--color-surface-raised)',
        line:            'var(--color-border)',
        'line-strong':   'var(--color-border-strong)',
        ink:             'var(--color-text)',
        'ink-muted':     'var(--color-text-muted)',
        'ink-subtle':    'var(--color-text-subtle)',
        accent:          'var(--color-accent)',
        'accent-hover':  'var(--color-accent-hover)',
        'accent-tint':   'var(--color-accent-muted)',
        'accent-ink':    'var(--color-accent-text)',
        danger:          'var(--color-error)',
        'danger-tint':   'var(--color-error-muted)',
        ok:              'var(--color-success)',
        'ok-tint':       'var(--color-success-muted)',
        caution:         'var(--color-warning)',
        'caution-tint':  'var(--color-warning-muted)',
        school:          'var(--color-school)',
        'school-tint':   'var(--color-school-muted)',
        college:         'var(--color-college)',
        'college-tint':  'var(--color-college-muted)',
      },
      // Ring for focus-visible states
      ringColor: {
        DEFAULT: 'var(--color-accent)',
      },
    },
  },
  plugins: [typography],
};
