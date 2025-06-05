import nextJest from 'next/jest';

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^next/(.*)$': '<rootDir>/node_modules/next/$1',
    },
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
};

export default createJestConfig(customJestConfig);
