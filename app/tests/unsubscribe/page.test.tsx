import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import UnsubscribePage from '@/app/unsubscribe/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('UnsubscribePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();

        // Mock successful token verification by default
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/newsletter/verify-token')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, message: 'Token is valid' })
                });
            }
            return Promise.reject(new Error('Unmocked fetch call'));
        });
    });

    it('should show invalid link message when no email provided', () => {
        mockUseSearchParams.mockReturnValue({
            get: (key: string) => null,
        } as any);

        render(<UnsubscribePage />);

        expect(screen.getByText('Invalid Unsubscribe Link')).toBeInTheDocument();
        expect(screen.getByText(/This unsubscribe link is invalid or incomplete/)).toBeInTheDocument();
    });

    it('should show invalid link message when no token provided', () => {
        mockUseSearchParams.mockReturnValue({
            get: (key: string) => key === 'email' ? 'test@example.com' : null,
        } as any);

        render(<UnsubscribePage />);

        expect(screen.getByText('Invalid Unsubscribe Link')).toBeInTheDocument();
    });

    it('should show unsubscribe form when email and token are provided', async () => {
        mockUseSearchParams.mockReturnValue({
            get: (key: string) => key === 'email' ? 'test@example.com' : key === 'token' ? 'valid-token' : null,
        } as any);

        render(<UnsubscribePage />);

        // Wait for token verification to complete
        await waitFor(() => {
            expect(screen.getByText('Unsubscribe from Newsletter')).toBeInTheDocument();
        });

        expect(screen.getByText(/Are you sure you want to unsubscribe/)).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should handle successful unsubscribe', async () => {
        mockUseSearchParams.mockReturnValue({
            get: (key: string) => key === 'email' ? 'test@example.com' : key === 'token' ? 'valid-token' : null,
        } as any);

        // Mock token verification
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/newsletter/verify-token')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, message: 'Token is valid' })
                });
            }
            if (url.includes('/api/newsletter?email=')) {
                return Promise.resolve({
                    json: () => Promise.resolve({
                        success: true,
                        message: 'Successfully unsubscribed from newsletter'
                    })
                });
            }
            return Promise.reject(new Error('Unmocked fetch call'));
        });

        render(<UnsubscribePage />);

        // Wait for token verification to complete
        await waitFor(() => {
            expect(screen.getByText('Unsubscribe from Newsletter')).toBeInTheDocument();
        });

        const unsubscribeButton = screen.getByText('Yes, Unsubscribe');
        fireEvent.click(unsubscribeButton);

        await waitFor(() => {
            expect(screen.getByText('Successfully Unsubscribed')).toBeInTheDocument();
        });

        expect(screen.getByText(/has been successfully unsubscribed/)).toBeInTheDocument();
    });

    it('should handle unsubscribe error', async () => {
        mockUseSearchParams.mockReturnValue({
            get: (key: string) => key === 'email' ? 'test@example.com' : key === 'token' ? 'valid-token' : null,
        } as any);

        // Mock token verification
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/newsletter/verify-token')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, message: 'Token is valid' })
                });
            }
            if (url.includes('/api/newsletter?email=')) {
                return Promise.resolve({
                    json: () => Promise.resolve({
                        success: false,
                        error: 'Email not found'
                    })
                });
            }
            return Promise.reject(new Error('Unmocked fetch call'));
        });

        render(<UnsubscribePage />);

        // Wait for token verification to complete
        await waitFor(() => {
            expect(screen.getByText('Unsubscribe from Newsletter')).toBeInTheDocument();
        });

        const unsubscribeButton = screen.getByText('Yes, Unsubscribe');
        fireEvent.click(unsubscribeButton);

        await waitFor(() => {
            expect(screen.getByText('Email not found')).toBeInTheDocument();
        });
    });

    it('should show loading state during unsubscribe', async () => {
        mockUseSearchParams.mockReturnValue({
            get: (key: string) => key === 'email' ? 'test@example.com' : key === 'token' ? 'valid-token' : null,
        } as any);

        // Mock token verification
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/newsletter/verify-token')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, message: 'Token is valid' })
                });
            }
            if (url.includes('/api/newsletter?email=')) {
                return new Promise(resolve => setTimeout(() => resolve({
                    json: () => Promise.resolve({
                        success: true,
                        message: 'Successfully unsubscribed from newsletter'
                    })
                }), 100));
            }
            return Promise.reject(new Error('Unmocked fetch call'));
        });

        render(<UnsubscribePage />);

        // Wait for token verification to complete
        await waitFor(() => {
            expect(screen.getByText('Unsubscribe from Newsletter')).toBeInTheDocument();
        });

        const unsubscribeButton = screen.getByText('Yes, Unsubscribe');
        fireEvent.click(unsubscribeButton);

        expect(screen.getByText('Unsubscribing...')).toBeInTheDocument();
        expect(unsubscribeButton).toBeDisabled();
    });
});
