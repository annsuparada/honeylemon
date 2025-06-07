import nextJest from 'next/jest';

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],  // important for fetch mocking
    testEnvironment: 'jest-environment-jsdom',        // needed for DOM-related tests
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^next/(.*)$': '<rootDir>/node_modules/next/$1',
    },
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
};

export default createJestConfig(customJestConfig);
