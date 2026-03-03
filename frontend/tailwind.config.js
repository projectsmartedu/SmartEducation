/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
        ,
        brand: {
          50: '#f5f7fb',
          100: '#e6eef9',
          200: '#cfe0f5',
          300: '#9fc1ee',
          400: '#66a6e6',
          500: '#3378d6',
          600: '#2b63b8',
          700: '#234a8a',
          800: '#172b4d',
          900: '#0b1424',
          950: '#061020'
        },
        accent: {
          DEFAULT: '#06b6d4',
          500: '#06b6d4',
          600: '#0891b2'
        },
        surface: {
          DEFAULT: '#0f172a'
        },
        muted: {
          DEFAULT: '#6b7280'
        }
      }
    },
  },
  plugins: [],
}
