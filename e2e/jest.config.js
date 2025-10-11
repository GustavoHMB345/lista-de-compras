module.exports = {
  testTimeout: 120000,
  testRunner: 'jest-circus/runner',
  reporters: ['detox/runners/jest/streamlineReporter'],
  setupFilesAfterEnv: ['detox/runners/jest/setup'],
  testMatch: ['**/?(*.)+(e2e).[jt]s?(x)'],
};
