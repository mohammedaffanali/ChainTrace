/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Semantic Theme Tokens */
        'theme-bg': 'var(--background)',
        'theme-bg-elevated': 'var(--background-elevated)',
        'theme-surface': 'var(--surface)',
        'theme-surface-secondary': 'var(--surface-secondary)',
        'theme-surface-tertiary': 'var(--surface-tertiary)',
        'theme-surface-subtle': 'var(--surface-subtle)',
        'theme-fg': 'var(--foreground)',
        'theme-heading': 'var(--heading)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-text-muted': 'var(--text-muted)',
        'theme-border': 'var(--border)',
        'theme-border-subtle': 'var(--border-subtle)',
        'theme-border-active': 'var(--border-active)',

        /* Semantic Functional Roles */
        'theme-primary': 'var(--primary)',
        'theme-primary-hover': 'var(--primary-hover)',
        'theme-primary-dim': 'var(--primary-dim)',
        'theme-accent': 'var(--accent)',
        'theme-accent-hover': 'var(--accent-hover)',
        'theme-accent-dim': 'var(--accent-dim)',
        'theme-crosschain': 'var(--crosschain)',
        'theme-crosschain-dim': 'var(--crosschain-dim)',
        'theme-gold': 'var(--gold)',
        'theme-gold-soft': 'var(--gold-soft)',
        'theme-gold-dim': 'var(--gold-dim)',

        /* Strict Forensic Confidence & Alert Scales */
        'theme-confidence-high': 'var(--confidence-high)',
        'theme-confidence-med': 'var(--confidence-med)',
        'theme-confidence-low': 'var(--confidence-low)',
        'theme-confidence-insufficient': 'var(--confidence-insufficient)',
        'theme-success': 'var(--success)',
        'theme-warning': 'var(--warning)',
        'theme-danger': 'var(--danger)',
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.375rem',
        'xl': '0.5rem',
        '2xl': '0.75rem',
        'full': '9999px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

