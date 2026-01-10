'use strict';

module.exports = {
  env: {
    browser: true,
    commonjs: false,
    es2023: true
  },
  extends: [
    'airbnb-base/legacy'
    // "prettier"
  ],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended'
      ],
      plugins: ['@typescript-eslint'],
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module'
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js', '.ts']
          }
        }
      },
      rules: {
        'import/extensions': ['error', 'ignorePackages', {
          js: 'never',
          ts: 'never'
        }],
        strict: ['error', 'global'],
        'no-eval': 'off',
        'new-cap': 'off',
        'no-promise-executor-return': 'off',
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: 'client|msg'
          }
        ],
        'no-await-in-loop': 'off',
        'no-restricted-syntax': 'off',
        'no-continue': 'off',
        'global-require': 'off',
        'no-unused-expressions': 'off',
        'one-var': 'off',
        'no-void': 'off',
        'no-param-reassign': 'off',
        'no-global-assign': 'off',
        '@typescript-eslint/no-unsafe-optional-chaining': 'off',
        'consistent-return': 'off'
      }
    }
  ]
};
