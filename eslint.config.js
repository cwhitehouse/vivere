import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['dist/**/*'],
    rules: {
      // Customized rules
      curly: ['error', 'multi'],
      'no-param-reassign': ['error', { props: false }],

      // Disabled rules
      'import/no-cycle': 'off',
      'max-len': 'off',
      'lines-between-class-members': 'off',
      'class-methods-use-this': 'off',
      'nonblock-statement-body-position': 'off',
      'object-curly-newline': 'off',
    },
  },
);
