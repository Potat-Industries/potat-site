'use strict';

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 64],
    'body-max-line-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'impr',
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ]
    ]
  }
};
