import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#0E0F11', // Premium Dark Base
        surface: '#1A1C20',    // Premium Surface
        accent: '#4BC9FF',     // Accent Glow
        accentSoft: '#8FD9FF', // Softer Accent
        textPrimary: '#FFFFFF', // Pure White
        textSecondary: '#A1A1AA', // Muted White
        borderSoft: '#27272A',   // Soft Border

        // Legacy brand colors (kept for compatibility if needed)
        brand: {
          blue: '#3E6BA3',
          beige: '#B79F8C',
          blueDark: '#2F537F',
          beigeLight: '#CEB7A6',
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(75, 201, 255, 0.15)',
        'glow-active': '0 0 30px rgba(75, 201, 255, 0.25)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-fine': 'linear-gradient(180deg, #0E0F11 0%, #1A1C20 100%)',
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
