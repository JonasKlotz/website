/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#ca8a04',
          light: 'rgba(202,138,4,0.12)',
        },
        ink: {
          DEFAULT: '#111110',
          muted: '#52524e',
          faint: '#8f8f8a',
        },
        surface: {
          DEFAULT: '#f9f9f7',
          elevated: '#ffffff',
        },
        line: '#e8e8e4',
      },
      fontFamily: {
        display: ['"Crimson Text"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      maxWidth: {
        content: '42rem',
      },
    },
  },
  plugins: [],
};
