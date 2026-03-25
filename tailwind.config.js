/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          medium: '#2D6A9F',
          light: '#EBF4FF',
        },
        accent: {
          DEFAULT: '#DC0032',
          light: '#FFF0F2',
        },
        denso: '#DC0032',
        success: '#10B981',
        danger: '#EF4444',
        surface: '#F8FAFC',
        muted: '#64748B',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-md': '0 4px 16px 0 rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
