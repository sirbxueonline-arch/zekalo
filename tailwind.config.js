/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand: deepened indigo-violet (scholarly, not candy) ──
        brand: {
          50: '#F3F2FD',
          100: '#E8E6FB',
          200: '#D4CFF7',
          300: '#B3A9F0',
          400: '#8A7CE8',
          500: '#574FCF', // PRIMARY
          DEFAULT: '#574FCF',
          600: '#4A41C0', // hover / 3D edge (student only)
          700: '#3E37A6',
          900: '#211C63',
        },
        // ── Legacy aliases (remapped to new brand) ──
        purple: { DEFAULT: '#574FCF', light: '#E8E6FB', dark: '#4A41C0', mid: '#8A7CE8' },
        teal: { DEFAULT: '#1FA855', light: '#E1F5EE', mid: '#5DCAA5', dark: '#15803D' },
        peach: { DEFAULT: '#EAB308', light: '#FEF7D6', dark: '#B45309' },
        sky: { DEFAULT: '#3BA8E6', light: '#E6F4FE', dark: '#1D7FB8' },

        // ── Muted accents (meaning + avatars only) ──
        grape: { DEFAULT: '#7C5CE0', light: '#F1ECFE' }, // achievements
        mint: { DEFAULT: '#1FA855', light: '#DCFCE7', dark: '#15803D' }, // success / accuracy
        sun: { DEFAULT: '#EAB308', light: '#FEF7D6', dark: '#B45309' }, // XP / gold (gamification only)
        coral: { DEFAULT: '#F4677E', light: '#FFE4E8', dark: '#E11D48' }, // streak warmth ONLY
        flame: { from: '#FF9A3C', to: '#FF5A1F', DEFAULT: '#FF7A2F' },

        // ── Semantic ──
        success: { DEFAULT: '#16A34A', tint: '#DCFCE7', text: '#15803D' },
        warning: { DEFAULT: '#F59E0B', tint: '#FEF3C7', text: '#B45309' },
        danger: { DEFAULT: '#EF4444', tint: '#FEE2E2', text: '#B91C1C' },
        info: { DEFAULT: '#3B82F6', tint: '#DBEAFE', text: '#1D4ED8' },

        // ── Neutrals (warm off-white — KEEP, premium) ──
        canvas: '#F6F6FB',
        surface: { DEFAULT: '#FFFFFF', 2: '#FBFBFE' },
        ink: { 900: '#1E2233', 700: '#3A3F52', 600: '#5A6072', 400: '#9AA0B0' },
        hairline: { DEFAULT: '#ECEDF3', strong: '#E2E4EC' },

        // ── Legacy tokens still referenced ──
        'border-soft': 'rgba(87,79,207,0.14)',
        'slate-text': '#1E2233',
        'slate-muted': '#5A6072',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        ctl: '6px',
        chip: '8px',
        input: '10px',
        tile: '12px',
        card: '14px',
        'card-lg': '18px',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,22,40,.05), 0 6px 16px -6px rgba(20,22,40,.10)',
        'soft-lg': '0 4px 12px -4px rgba(20,22,40,.08), 0 12px 28px -10px rgba(20,22,40,.14)',
        pop: '0 8px 24px -8px rgba(20,22,40,.14)',
        modal: '0 16px 48px -12px rgba(20,22,40,.22)',
        edge: '0 3px 0 0 #4A41C0',
        'edge-active': '0 0 0 0 #4A41C0',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.34,1.4,.64,1)',
        'out-quint': 'cubic-bezier(.22,1,.36,1)',
        enter: 'cubic-bezier(.2,.8,.2,1)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(.7)', opacity: '0' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'flame-pulse': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        pop: 'pop .32s cubic-bezier(.34,1.4,.64,1) both',
        bob: 'bob 3s ease-in-out infinite',
        'fade-up': 'fade-up .45s cubic-bezier(.2,.8,.2,1) both',
        'flame-pulse': 'flame-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
