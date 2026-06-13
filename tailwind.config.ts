import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design Lead Palette for 'The Royal Study' (Royal & Academic theme)
        parchment: {
          light: '#F8F6F0',
          DEFAULT: '#F4F1EA',
          dark: '#EBE6DA',
        },
        royal: {
          light: '#2A4365',
          DEFAULT: '#1A365D',
          dark: '#0F2042',
        },
        gold: {
          light: '#F6AD55',
          DEFAULT: '#D69E2E',
          dark: '#B7791F',
        },
        accent: {
          emerald: '#059669',
          rose: '#E11D48',
          slate: '#475569',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(26, 54, 93, 0.15), 0 1px 3px rgba(26, 54, 93, 0.05)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
};
export default config;
