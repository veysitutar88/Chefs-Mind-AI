import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3E6BA3', // Na'Vi Blue
          beige: '#B79F8C', // Beige
          blueDark: '#2F537F',
          beigeLight: '#CEB7A6',
        },
      },
      backgroundImage: {
        'gradient-fine': 'linear-gradient(180deg, #0B1020 0%, #111827 100%)',
      },
      borderColor: {
        brand: '#3E6BA3',
      },
    },
  },
  plugins: [],
};
export default config;
