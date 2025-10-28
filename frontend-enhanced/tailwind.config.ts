import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fine Dining palette - элегантные и премиальные цвета
        'chef-black': '#0a0a0a',
        'chef-gray': '#1a1a1a',
        'chef-silver': '#c0c0c0',
        'chef-gold': '#d4af37',
        'chef-cream': '#faf8f3',
        'chef-burgundy': '#722f37',
        'chef-sage': '#8a9a5b',
        'chef-blue': '#2c5282',
        'chef-pearl': '#f8f6f0',
      },
      fontFamily: {
        'fine': ['Georgia', 'serif'],
        'modern': ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'fine': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elegant': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'fine': '0.375rem',
      },
    },
  },
  plugins: [],
};
export default config;