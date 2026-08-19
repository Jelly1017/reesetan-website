/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Option B: Terracotta palette (primitives)
      colors: {
        terracotta: {
          50: 'oklch(96% 0.02 35)',
          100: 'oklch(94% 0.025 35)',
          200: 'oklch(88% 0.05 35)',
          300: 'oklch(80% 0.08 35)',
          400: 'oklch(72% 0.11 35)',
          500: 'oklch(62% 0.14 35)',
          600: 'oklch(52% 0.13 35)',
          700: 'oklch(44% 0.11 35)',
          800: 'oklch(36% 0.09 35)',
          900: 'oklch(28% 0.07 35)',
        },
        paper: {
          1: 'oklch(98.5% 0.012 85)',
          2: 'oklch(96% 0.014 85)',
          3: 'oklch(93% 0.016 85)',
          4: 'oklch(89% 0.018 85)',
          5: 'oklch(82% 0.018 85)',
          6: 'oklch(70% 0.016 85)',
          7: 'oklch(56% 0.015 85)',
          8: 'oklch(40% 0.013 85)',
          9: 'oklch(28% 0.012 85)',
          10: 'oklch(18% 0.012 50)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Noto Serif SC', 'Source Han Serif SC', 'serif'],
        sans: ['Inter', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
    },
  },
  plugins: [],
};
