import colors from 'tailwindcss/colors';

export default {
  purge: [
    'examples/**/*.html',
    'examples/**/*.js',
    'examples/**/*.ejs',
    'examples/**/*.css',
  ],

  theme: {
    colors: {
      ...colors,
      gray: colors.blueGray,
    },

    flex: {
      1: '1 1 0%',
      2: '2 2 0%',
      3: '2 2 0%',
      4: '2 2 0%',
      5: '2 2 0%',
    },

    extend: {
      fontFamily: {
        display: [
          'Secular One',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
    },
  },

  variants: {
    boxShadow: ['responsive', 'hover', 'focus', 'active', 'disabled'],
    opacity: ['responsive', 'hover', 'focus', 'active', 'disabled'],

    extend: {
      borderRadius: ['first', 'last'],
    },
  },
};
