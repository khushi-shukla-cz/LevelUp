/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette
        bg: {
          primary: '#080C14',
          secondary: '#0D1117',
          card: '#111827',
          elevated: '#161D2B',
          border: '#1E2A3A',
        },
        brand: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        text: {
          primary: '#F0F4FF',
          secondary: '#94A3B8',
          muted: '#4B5563',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E2A3A' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'radial-blue': 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 60%)',
        'radial-purple': 'radial-gradient(ellipse at 100% 50%, rgba(139,92,246,0.1) 0%, transparent 50%)',
        'hero-glow': 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(59,130,246,0.2) 0%, transparent 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'xp-fill': 'xp-fill 1s ease-out forwards',
        'level-up': 'level-up 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'streak-fire': 'streak-fire 1s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59,130,246,0.6)' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'xp-fill': {
          from: { width: '0%' },
          to: { width: 'var(--xp-width)' },
        },
        'level-up': {
          '0%': { transform: 'scale(0.5)', opacity: 0 },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'streak-fire': {
          from: { filter: 'hue-rotate(0deg) brightness(1)' },
          to: { filter: 'hue-rotate(20deg) brightness(1.3)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(59,130,246,0.3)',
        'glow-purple': '0 0 30px rgba(139,92,246,0.3)',
        'glow-green': '0 0 20px rgba(34,197,94,0.3)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
      }
    },
  },
  plugins: [],
}
