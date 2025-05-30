/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          0: '#7A495B',
          25: '#634758',
          50: '#BE6A87',
          75: '#E7DDDE',
          90: '#F4F2F1',
          100: '#FFFFFF',
        },
        yellow1: '#BBA045',
        primary: '#7A495B',
        secondary: '#FFFFFF',
        extra: '#BE6A87',
        dark: '#7A495B',
        light: '#FFFFFF',
        light2: '#F4F2F1',
        highlight: '#BE6A87',
      },
      fontFamily: {
        afacad: ["Afacad", 'sans-serif'],
        dmSerifText: ["DM Serif Text", 'serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.dark'),
            fontFamily: theme('fontFamily.afacad').join(', '),
            p: {
              fontSize: theme('fontSize.base'),
              lineHeight: theme('lineHeight.relaxed'),
            },
            a: {
              color: theme('colors.extra'),
              '&:hover': {
                color: theme('colors.extra'),
              },
            },
            h1: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
            },
            h2: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
            },
            h3: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
            },
            h4: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
            },
            strong: {
              color: theme('colors.dark'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-motion'),
    require('tailwindcss-intersect')
  ],
} 