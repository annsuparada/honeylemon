import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';


fetchMock.enableMocks();

// Optional: silence console noise during test runs
jest.spyOn(console, 'error').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });

// Declare global fetch for TypeScript
declare global {
    interface Window {
        fetch: typeof fetch;
    }
}

// Globally mock NextResponse.json to avoid per-test mocking
jest.mock('next/server', () => {
    const actual = jest.requireActual('next/server');
    return {
        ...actual,
        NextResponse: {
            json: jest.fn((data, init) => {
                return {
                    status: init?.status || 200,
                    async json() {
                        return data;
                    },
                };
            }),
        },
    };
});

jest.mock('@/prisma/client');