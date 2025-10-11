// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  // Enable Prettier as an ESLint rule and disable conflicting rules
  prettierRecommended,
  {
    ignores: ['dist/*'],
  },
  // Jest test files: define globals so lint doesn't error on jest/describe/it/expect
  {
    files: ['**/__tests__/**', '**/*.test.*', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
  // Detox e2e tests
  {
    files: ['e2e/**/*.e2e.*', 'e2e/**/*.test.*', 'e2e/**'],
    languageOptions: {
      globals: {
        device: 'readonly',
        element: 'readonly',
        by: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
]);
