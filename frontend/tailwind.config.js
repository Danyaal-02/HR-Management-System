/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#a855f7',
          pink: '#d946ef',
          dark: '#9333ea',
          darker: '#7e22ce',
        },
        // Background Colors
        bg: {
          dark: '#0a0a0f',
          card: '#13131a',
          'card-hover': '#1a1a24',
          input: '#1a1a24',
          'input-focus': '#1e1e2a',
        },
        // Text Colors
        text: {
          primary: '#f0f0f5',
          secondary: '#a0a0b8',
          muted: '#6b6b80',
          link: '#c084fc',
          'link-hover': '#d8b4fe',
        },
        // Status Colors
        status: {
          success: '#22c55e',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
      },
      backgroundColor: {
        dark: '#0a0a0f',
        card: '#13131a',
        'card-hover': '#1a1a24',
        input: '#1a1a24',
        'input-focus': '#1e1e2a',
      },
      textColor: {
        primary: '#f0f0f5',
        secondary: '#a0a0b8',
        muted: '#6b6b80',
        link: '#c084fc',
        'link-hover': '#d8b4fe',
      },
      borderColor: {
        DEFAULT: '#2a2a3a',
        focus: '#a855f7',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        glow: '0 0 30px rgba(168, 85, 247, 0.15)',
        button: '0 4px 15px rgba(168, 85, 247, 0.4)',
        'button-hover': '0 6px 25px rgba(168, 85, 247, 0.6)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      transitionDuration: {
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a855f7, #d946ef)',
        'gradient-hover': 'linear-gradient(135deg, #9333ea, #c026d3)',
      },
    },
  },
  plugins: [],
}
