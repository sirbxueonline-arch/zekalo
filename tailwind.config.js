/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Pastel periwinkle (replaces harsh #534AB7)
        purple: { DEFAULT: '#7c6ee0', light: '#eef0ff', dark: '#5e4fc7', mid: '#9d92ea' },
        // Pastel mint (replaces harsh #1D9E75)
        teal: { DEFAULT: '#5db8a3', light: '#eef5f2', mid: '#7fcab8' },
        // Pastel peach + blue
        peach: { DEFAULT: '#e8a87c', light: '#fdf5ee', dark: '#cf8d62' },
        sky: { DEFAULT: '#6b9dde', light: '#eef4fc', dark: '#5283c7' },
        // Surfaces
        surface: '#f8f7fb',
        'border-soft': 'rgba(124,110,224,0.15)',
        'slate-text': '#1a1a2e',
        'slate-muted': '#64748b',
      },
      fontFamily: {
        serif: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
