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

        /* Forensic Intelligence Master Palette */
        'void': '#15171B',
        'obsidian': '#1C1D20',
        'abyss': '#101827',
        'deepblue': '#14243A',
        'charcoal': '#25282D',

        /* Warm Whites & Typography */
        'cream': '#F4F0E6',
        'eggshell': '#F0EAD6',
        'snow': '#FAFAF5',
        'winter': '#E8E8E3',
        'warm-secondary': '#D8D3C7',
        'warm-muted': '#9D9A92',
        'warm-dim': '#74736F',

        /* Distinctive Signal Accents */
        'denim': '#1560BD',
        'queen-blue': '#436B95',
        'aero': '#7CB9E8',
        'carmin': '#960018',
        'crimson': '#B22222',
        'persian-red': '#C44536',
        'forest': '#1B512D',
        'hunter': '#3C5223',
        'olivine': '#ADC178',
        'tea-green': '#C2F8CB',
        'twilight': '#2A0134',
        'imperial': '#5D3A9C',
        'amethyst': '#B23AEE',
        'orchid': '#DA70D6',
        'teal-cyan': '#006666',
        'mineral-cyan': '#2A7F7F',
        'tropical-cyan': '#00BFC1',
        'turquoise': '#40E0D0',
      },
      boxShadow: {
        'glass-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'glass-elevated': '0 12px 36px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glow-denim': '0 0 16px -2px rgba(21, 96, 189, 0.35)',
        'glow-carmin': '0 0 16px -2px rgba(150, 0, 24, 0.4)',
        'glow-forest': '0 0 16px -2px rgba(27, 81, 45, 0.4)',
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        'editorial': ['Syne', 'Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

