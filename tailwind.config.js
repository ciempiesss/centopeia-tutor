/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hacker: {
          bg: '#0a0a0a',
          bgSecondary: '#111111',
          bgTertiary: '#1a1a1a',
          border: '#2a2a2a',
          borderHover: '#3a3a3a',
          primary: '#00ff41',
          primaryDim: '#00cc33',
          primaryDark: '#008f11',
          secondary: '#00f0ff',
          secondaryDim: '#00c0cc',
          accent: '#ffb000',
          accentDim: '#cc8c00',
          error: '#ff3333',
          errorDim: '#cc2929',
          text: '#e0e0e0',
          textMuted: '#888888',
          textDim: '#555555',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s ease-in',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff41' },
          '100%': { boxShadow: '0 0 20px #00ff41, 0 0 40px #00ff41' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      // Safe area utilities for mobile
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
      },
      spacing: {
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        'touch': '44px', // Apple HIG minimum touch target
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [
    // Custom plugin for touch manipulation
    function({ addUtilities }) {
      addUtilities({
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.overscroll-contain': {
          'overscroll-behavior': 'contain',
        },
        '.overscroll-none': {
          'overscroll-behavior': 'none',
        },
        '.text-glow': {
          'text-shadow': '0 0 10px currentColor',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
}
