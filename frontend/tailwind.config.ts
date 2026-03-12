import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080810',
          secondary: '#0f0f1a',
          card: '#13131f',
          hover: '#1a1a2e',
        },
        accent: {
          green: '#22c55e',
          'green-dim': '#16a34a',
          blue: '#3b82f6',
          purple: '#a855f7',
          orange: '#f97316',
        },
        border: { DEFAULT: '#1e1e30', light: '#2a2a42' },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        'glow-green': '0 0 20px rgba(34,197,94,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
