/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        purple: { DEFAULT: '#534AB7', light: '#EEEDFE', dark: '#3C3489', mid: '#7F77DD' },
        teal: { DEFAULT: '#1D9E75', light: '#E1F5EE', mid: '#5DCAA5' },
        surface: '#f7f6ff',
        'border-soft': '#e8e6f8',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
