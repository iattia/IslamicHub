import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { canvas: 'hsl(var(--canvas))', panel: 'hsl(var(--panel))', ink: 'hsl(var(--ink))', muted: 'hsl(var(--muted))', line: 'hsl(var(--line))', sand: 'hsl(var(--sand))', accent: 'hsl(var(--accent))' }, fontFamily: { sans: ['var(--font-sans)'], arabic: ['var(--font-arabic)'] }, borderRadius: { xl: '1rem', '2xl': '1.35rem' } } },
  plugins: [],
} satisfies Config;
