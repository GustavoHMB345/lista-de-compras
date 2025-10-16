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
  // Test-specific configs removed
]);
