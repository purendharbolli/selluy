/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f2',
          100: '#ffe8e2',
          200: '#ffd5c9',
          300: '#ffb5a3',
          400: '#ff8266',
          500: '#f95738', // signature energetic coral
          600: '#e64020',
          700: '#c22f13',
          800: '#9b2913',
          900: '#7e2716',
        },
        sand: {
          50: '#fbfaf8',
          100: '#f5f2eb',
          200: '#ede7db',
          300: '#ded3c1',
          400: '#c5b59d',
        },
        trust: {
          50: '#ecfdf5',
          100: '#d1fae5',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(17, 24, 39, 0.05)',
        'soft': '0 6px 20px -4px rgba(17, 24, 39, 0.07)',
        'soft-lg': '0 12px 30px -6px rgba(17, 24, 39, 0.1)',
        'float': '0 20px 40px -10px rgba(249, 87, 56, 0.15)',
      },
    },
  },
  plugins: [],
}
