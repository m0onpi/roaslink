import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#0f0f23',
          secondary: '#1a1a2e',
          tertiary: '#16213e',
          surface: '#0e1217',
          'surface-hover': '#1a1f2e',
          accent: '#6366f1',
          'accent-hover': '#5b21b6',
          text: '#e2e8f0',
          'text-secondary': '#94a3b8',
          'text-muted': '#64748b',
          border: '#374151',
          'border-light': '#4b5563',
        },
        light: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          surface: '#ffffff',
          'surface-hover': '#f8fafc',
          accent: '#3b82f6',
          'accent-hover': '#2563eb',
          text: '#1e293b',
          'text-secondary': '#475569',
          'text-muted': '#64748b',
          border: '#e2e8f0',
          'border-light': '#f1f5f9',
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-light': 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
        'gradient-accent-dark': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-accent-light': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;