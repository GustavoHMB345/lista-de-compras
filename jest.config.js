/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo/android',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/__tests__/**/*.[jt]sx?'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|expo(nent)?|@expo(nent)?/.*|expo-modules-core|react-native-web|@react-navigation/.*)/)',
  ],
  testEnvironment: 'jsdom',
};
