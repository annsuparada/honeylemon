/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    transform: {
        '^.+\\.(ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(@?next|@?react|@?nanoid)/)',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^next/(.*)$': '<rootDir>/node_modules/next/$1',
    },
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
};
