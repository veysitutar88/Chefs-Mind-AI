import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
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
    },
  },
  plugins: [],
};
export default config;
