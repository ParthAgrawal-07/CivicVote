// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f0f0e',
          2: '#4a4a47',
          3: '#8a8a85',
          4: '#b8b8b2',
        },
        paper: {
          DEFAULT: '#faf9f6',
          2: '#f2f1ed',
          3: '#e8e7e1',
        },
        accent: {
          DEFAULT: '#1a3a5c',
          2: '#2e6da4',
          light: '#e8f0f8',
        },
        cvgreen: {
          DEFAULT: '#1d7a4f',
          light: '#e6f4ed',
        },
        cvred: {
          DEFAULT: '#c0392b',
          light: '#fcecea',
        },
        cvamber: {
          DEFAULT: '#b56a00',
          light: '#fef3e2',
        },
        cvgold: {
          DEFAULT: '#b5862a',
          light: '#fdf3dc',
        },
      },
      borderRadius: {
        cv: '8px',
        'cv-lg': '14px',
        'cv-xl': '20px',
      },
      boxShadow: {
        cv: '0 2px 12px rgba(15,15,14,0.07), 0 1px 3px rgba(15,15,14,0.05)',
        'cv-lg': '0 8px 32px rgba(15,15,14,0.10), 0 2px 8px rgba(15,15,14,0.06)',
      },
    },
  },
  plugins: [],
};
