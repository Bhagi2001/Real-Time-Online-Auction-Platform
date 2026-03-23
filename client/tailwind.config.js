/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5C',
          dark: '#E55A26',
        },
        secondary: {
          DEFAULT: '#1A1A2E',
          light: '#252545',
          dark: '#0F0F1A',
        },
        accent: {
          DEFAULT: '#F7C948',
          light: '#FFDE7D',
          dark: '#D4A800',
        },
        surface: '#F8F9FA',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-bid': 'pulseBid 0.6s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'countdown-pulse': 'countdownPulse 1s ease-in-out infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseBid: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)', backgroundColor: '#FF6B35', color: 'white' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        countdownPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.14)',
        'primary': '0 4px 16px rgba(255,107,53,0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1A1A2E 0%, #252545 50%, #1A1A2E 100%)',
        'card-gradient': 'linear-gradient(to bottom, transparent 50%, rgba(26,26,46,0.85) 100%)',
      },
    },
  },
  plugins: [],
}
