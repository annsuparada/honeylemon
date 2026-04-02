const path = require('path');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: path.join(__dirname, '../../apps/travomad'),
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@honeylemon/ui$': '<rootDir>/src/index.ts',
    '^@honeylemon/ui/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);

