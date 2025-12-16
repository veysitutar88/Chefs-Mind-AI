import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--bg-root)',
        surface: 'var(--bg-surface)',
        foreground: 'var(--text-primary)',

        primary: {
          DEFAULT: 'var(--accent)',
          foreground: '#ffffff',
        },
        accent: 'var(--accent)',

        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        borderSoft: 'var(--border-soft)',

        // Legacy brand colors (kept for compatibility)
        brand: {
          blue: '#0EA5E9', // Re-mapped to accent for consistency
          beige: '#B79F8C',
          blueDark: '#0f172a',
          beigeLight: '#CEB7A6',
        },
      },
      boxShadow: {
        'glow': '0 0 20px var(--accent-glow)',
        'glow-active': '0 0 30px var(--accent-glow)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-fine': 'linear-gradient(180deg, var(--bg-root) 0%, var(--bg-surface) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
