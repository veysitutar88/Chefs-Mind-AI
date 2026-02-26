import type { Config } from 'tailwindcss';

/** UICanon v2.5 — Tailwind Config */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        /* Semantic aliases → CSS vars */
        background:  'var(--bg-root)',
        surface:     'var(--bg-surface)',
        elevated:    'var(--bg-elevated)',
        foreground:  'var(--text-primary)',
        muted:       'var(--text-muted)',

        accent: {
          DEFAULT: 'var(--accent)',
          light:   'var(--accent-light)',
          glow:    'var(--accent-glow)',
          subtle:  'var(--accent-subtle)',
        },

        primary: {
          DEFAULT:    'var(--accent)',
          foreground: '#ffffff',
        },

        border: {
          subtle: 'var(--border-subtle)',
          soft:   'var(--border-soft)',
          strong: 'var(--border-strong)',
          accent: 'var(--border-accent)',
        },

        /* Canon 2.5 raw tokens */
        canon: {
          root:    '#0B0F2A',
          surface: '#11183D',
          alt:     '#0F172A',
          navi:    '#0EA5E9',
        },
      },

      borderRadius: {
        card:    'var(--radius-card)',
        overlay: 'var(--radius-overlay)',
        control: 'var(--radius-control)',
        pill:    'var(--radius-pill)',
      },

      boxShadow: {
        glow:        '0 0 20px var(--accent-glow)',
        'glow-lg':   '0 0 40px var(--accent-glow)',
        'glow-ring': '0 0 0 1px var(--border-accent), 0 0 16px var(--accent-glow)',
        overlay:     '0 32px 80px rgba(0,0,0,0.6)',
        card:        '0 4px 20px rgba(0,0,0,0.3)',
      },

      backgroundImage: {
        'gradient-root': 'linear-gradient(180deg, var(--bg-root) 0%, var(--bg-surface) 100%)',
      },

      transitionDuration: {
        fast: '120',
        base: '200',
        slow: '320',
      },

      animation: {
        'fade-in':        'fadeIn 200ms ease forwards',
        'fade-in-up':     'fadeInUp 240ms ease forwards',
        'slide-in-right': 'slideInRight 200ms ease forwards',
        'slide-in-left':  'slideInLeft 200ms ease forwards',
        'scale-in':       'scaleIn 180ms ease forwards',
        'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px var(--accent-glow)' },
          '50%':       { boxShadow: '0 0 28px var(--accent-glow)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
