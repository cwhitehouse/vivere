module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // Customized rules
    'curly': ['error', 'multi'],
    'no-param-reassign': ['error', { 'props': false }],

    // Disabled rules
    'import/no-cycle': 'off',
    'max-len': 'off',
    'lines-between-class-members': 'off',
    'class-methods-use-this': 'off',
    'nonblock-statement-body-position': 'off',
    'object-curly-newline': 'off',
  },
};
