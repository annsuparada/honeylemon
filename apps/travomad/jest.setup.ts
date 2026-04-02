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

// Polyfill for getClientRects - needed for TipTap/ProseMirror in jsdom
// jsdom has getClientRects but it doesn't work correctly with ProseMirror
// Override it with a working implementation
const mockGetClientRects = function() {
    const mockRect = {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    };
    const rectList = {
        length: 1,
        item: (index: number) => (index === 0 ? mockRect : null),
        0: mockRect,
        [Symbol.iterator]: function* () {
            yield mockRect;
        },
    };
    return rectList as any;
};

// Apply to Element prototype if it exists
if (typeof Element !== 'undefined') {
    Object.defineProperty(Element.prototype, 'getClientRects', {
        value: mockGetClientRects,
        writable: true,
        configurable: true,
    });
}

// Also apply to Range prototype if it exists (ProseMirror sometimes uses Range)
if (typeof Range !== 'undefined') {
    Object.defineProperty(Range.prototype, 'getClientRects', {
        value: mockGetClientRects,
        writable: true,
        configurable: true,
    });
}

global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
    unobserve() {}
} as unknown as typeof IntersectionObserver;