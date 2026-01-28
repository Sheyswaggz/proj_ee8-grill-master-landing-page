import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      'coverage/**',
      '.vite/**',
      'build/**'
    ]
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: false
        }
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-duplicate-imports': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-destructuring': ['error', {
        array: false,
        object: true
      }],
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'error',
      'require-await': 'error',
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-throw-literal': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-shadow': ['error', { builtinGlobals: false }],
      'no-use-before-define': ['error', { 
        functions: false,
        classes: true,
        variables: true
      }],
      'camelcase': ['error', { properties: 'never' }],
      'consistent-return': 'error',
      'curly': ['error', 'all'],
      'default-case': 'error',
      'default-case-last': 'error',
      'dot-notation': 'error',
      'no-alert': 'warn',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-empty-function': 'error',
      'no-lonely-if': 'error',
      'no-multi-assign': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-return': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-object-spread': 'error',
      'yoda': 'error',
      'array-callback-return': 'error',
      'no-constructor-return': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-optional-chaining': 'error',
      'require-atomic-updates': 'error'
    }
  }
];