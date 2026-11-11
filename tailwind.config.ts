import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Genza brand colors
        blue: {
          500: '#22539F',
          400: '#3173B8',
          600: '#22539F',
          700: '#22539F',
          800: '#22539F',
          900: '#22539F',
        },
        yellow: {
          400: '#F6CC46',
        },
        navy: {
          700: '#22539F',
        },
        slate: {
          800: '#2B2F3A',
          500: '#5B6475',
        },
        mist: {
          50: '#F4F6FE',
        },
        // shadcn CSS variable tokens
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        panel: '32px',
        md: '16px',
        lg: '24px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 10px 40px rgba(34, 83, 159, 0.12)',
        cardHover: '0 16px 48px rgba(34, 83, 159, 0.20)',
      },
    },
  },
  plugins: [],
}
export default config
