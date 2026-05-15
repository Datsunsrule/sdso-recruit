/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#c8760a',
        accentHov: '#a3600a',
        accentLight: '#fff3e0',
        bg: '#f0f2f5',
        surface: '#ffffff',
        surfaceAlt: '#f8f9fa',
        border: '#e1e4e8',
        borderFocus: '#c8760a',
        text: '#1a1a2e',
        textSub: '#6b7280',
        textMuted: '#9ca3af',
        success: '#16a34a',
        successLight: '#dcfce7',
        warning: '#d97706',
        warningLight: '#fef3c7',
        danger: '#dc2626',
        dangerLight: '#fee2e2',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: { base: '14px' },
      borderRadius: { card: '12px' },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
