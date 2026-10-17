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
        forest: {
          50: '#F0F7F4',
          100: '#DDEFE7',
          200: '#BDDFCFA',
          300: '#91C8B0',
          400: '#5FAA8B',
          500: '#3D8C6D',
          600: '#2D6E54',
          700: '#235743',
          800: '#1C4535',
          900: '#143327',
          950: '#0B1C15',
        },
        ivory: {
          50: '#FCFCF9',
          100: '#FAF8F3',
          200: '#F4EFE6',
          300: '#EDE5D5',
          400: '#E1D4BD',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E6ECE8',
          200: '#CFDDD3',
          300: '#B2C7B9',
          400: '#8FAAA9',
          500: '#6E8F79',
          600: '#56715F',
        },
        mint: {
          50: '#F2FBF7',
          100: '#E1F6ED',
          200: '#C2EDDB',
          300: '#93DEC1',
          400: '#5DC6A1',
          500: '#34AC84',
        },
        gold: {
          50: '#FEF9EE',
          100: '#FDF1D5',
          200: '#FBE1AA',
          300: '#F7CB75',
          400: '#F1AC38',
          500: '#E08E15',
          600: '#C4700E',
          700: '#9B5010',
        },
        night: {
          900: '#0D1412',
          850: '#121C19',
          800: '#172420',
          750: '#1E2F2A',
          700: '#273B35',
          600: '#364F47',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(20, 61, 43, 0.08)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
