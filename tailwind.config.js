/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blueprint: {
          50: '#F0F6FA',
          100: '#E1EDF5',
          200: '#BAD6EB',
          300: '#87B7DD',
          400: '#5297CF',
          500: '#2878A8', // Steel Blue
          600: '#1B5B8E',
          700: '#164B78', // Blueprint Blue
          800: '#103859',
          900: '#0C263D',
          950: '#071624',
        },
        steel: {
          DEFAULT: '#2878A8',
          light: '#4293C2',
          dark: '#1E5E85',
        },
        safety: {
          DEFAULT: '#FFD43B', // Construction Yellow
          dark: '#E5BD2E',
          light: '#FFE476',
          amber: '#F59E0B',
          orange: '#F97316', // High-vis orange
        },
        terracotta: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C', // Brick Terracotta
          800: '#9A3412',
          900: '#7C2D12',
        },
        concrete: {
          50: '#FAFBFB',
          100: '#F4F6F7', // Light Concrete BG
          200: '#E9ECED',
          300: '#D5D9DC', // Cool Concrete
          400: '#B0B6BA',
          500: '#889196',
          600: '#646D72',
          700: '#464D52',
          800: '#2D3337',
          900: '#252C32', // Structural Charcoal
          950: '#181C20',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'blueprint-grid': "radial-gradient(circle, rgba(40, 120, 168, 0.15) 1px, transparent 1px)",
        'blueprint-grid-dark': "radial-gradient(circle, rgba(82, 151, 207, 0.18) 1px, transparent 1px)",
        'grid-lines': "linear-gradient(to right, rgba(22, 75, 120, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(22, 75, 120, 0.05) 1px, transparent 1px)",
        'grid-lines-dark': "linear-gradient(to right, rgba(82, 151, 207, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(82, 151, 207, 0.08) 1px, transparent 1px)",
        'stripes-hazard': "repeating-linear-gradient(45deg, #FFD43B, #FFD43B 10px, #252C32 10px, #252C32 20px)",
      },
      boxShadow: {
        'blueprint': '0 4px 20px -2px rgba(22, 75, 120, 0.12)',
        'blueprint-lg': '0 10px 30px -4px rgba(22, 75, 120, 0.2)',
        'safety': '0 4px 14px 0 rgba(255, 212, 59, 0.35)',
      }
    },
  },
  plugins: [],
}

