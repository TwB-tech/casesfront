module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Professional Legal Palette
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        // Accent Colors - Trust & Professionalism
        accent: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff',
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },
        // Success/Green - Positive Outcomes
        success: {
          50: '#e6f4ea',
          100: '#cbf0d8',
          200: '#9fe6b8',
          300: '#6dd58c',
          400: '#38c172',
          500: '#2ecc71',
          600: '#22a85a',
          700: '#188747',
          800: '#10703c',
          900: '#0a562d',
        },
        // Warning/Orange - Important Notices
        warning: {
          50: '#fff8e6',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ffc107',
          600: '#ffb300',
          700: '#ffa000',
          800: '#ff8f00',
          900: '#ff6f00',
        },
        // Error/Red - Critical Actions
        danger: {
          50: '#ffeaea',
          100: '#ffd1d1',
          200: '#ff9e9e',
          300: '#ff6b6b',
          400: '#ff3333',
          500: '#f5222d',
          600: '#cf1322',
          700: '#a8071a',
          800: '#820014',
          900: '#5c0011',
        },
        // Neutral Grays
        neutral: {
          50: '#f7f7f7',
          100: '#eeeeee',
          200: '#e0e0e0',
          300: '#bdbdbd',
          400: '#9e9e9e',
          500: '#757575',
          600: '#616161',
          700: '#424242',
          800: '#212121',
          900: '#1a1a1a',
        },
        // Background Gradients
        gradient: {
          primary: 'linear-gradient(135deg, #102a43 0%, #243b53 100%)',
          accent: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          hero: 'linear-gradient(106.5deg, #f0f4f8 0%, #ffffff 100%)',
          card: 'linear-gradient(180deg, #ffffff 0%, #f7fafc 100%)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 32px rgba(16, 42, 67, 0.15)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'floating': '0 12px 48px rgba(16, 42, 67, 0.2)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'natural': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
};
