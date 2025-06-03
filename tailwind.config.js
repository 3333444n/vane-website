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
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'slide-up': 'slideUp 0.7s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(1.5rem)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(1.5rem)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.dark'),
            fontFamily: theme('fontFamily.afacad').join(', '),
            maxWidth: 'none',
            p: {
              fontSize: theme('fontSize.base'),
              lineHeight: theme('lineHeight.relaxed'),
              marginBottom: theme('spacing.4'),
            },
            a: {
              color: theme('colors.extra'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.extra'),
                textDecoration: 'underline',
              },
            },
            h1: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
              fontSize: theme('fontSize.4xl'),
              fontWeight: '400',
              marginBottom: theme('spacing.6'),
            },
            h2: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
              fontSize: theme('fontSize.3xl'),
              fontWeight: '400',
              marginBottom: theme('spacing.4'),
            },
            h3: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
              fontSize: theme('fontSize.2xl'),
              fontWeight: '400',
              marginBottom: theme('spacing.3'),
            },
            h4: {
              color: theme('colors.dark'),
              fontFamily: theme('fontFamily.dmSerifText').join(', '),
              fontSize: theme('fontSize.xl'),
              fontWeight: '400',
              marginBottom: theme('spacing.3'),
            },
            strong: {
              color: theme('colors.dark'),
              fontWeight: '600',
            },
            ul: {
              listStyleType: 'disc',
              paddingLeft: theme('spacing.6'),
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: theme('spacing.6'),
            },
            li: {
              marginBottom: theme('spacing.2'),
            },
          },
        },
        sm: {
          css: {
            fontSize: theme('fontSize.sm'),
            lineHeight: theme('lineHeight.relaxed'),
          },
        },
        lg: {
          css: {
            fontSize: theme('fontSize.lg'),
            lineHeight: theme('lineHeight.relaxed'),
          },
        },
        xl: {
          css: {
            fontSize: theme('fontSize.xl'),
            lineHeight: theme('lineHeight.relaxed'),
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