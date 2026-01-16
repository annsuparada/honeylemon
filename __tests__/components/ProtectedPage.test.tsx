import { render, screen, waitFor } from '@testing-library/react';
import ProtectedPage from '@/app/components/ProtectedPage';
import '@testing-library/jest-dom';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

beforeEach(() => {
    mockPush.mockReset();
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => { }); // suppress invalid token logs
});

afterEach(() => {
    (console.error as jest.Mock).mockRestore(); // restore after each test
});

describe('ProtectedPage', () => {
    it('redirects to /login when no token is found', async () => {
        render(<ProtectedPage><div>Protected Content</div></ProtectedPage>);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('redirects to /login when token is expired', async () => {
        const expiredToken = [
            'header',
            btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 })),
            'sig'
        ].join('.');
        localStorage.setItem('token', expiredToken);

        render(<ProtectedPage><div>Protected Content</div></ProtectedPage>);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('redirects to /login when token is invalid', async () => {
        localStorage.setItem('token', 'invalid.token.string');

        render(<ProtectedPage><div>Protected Content</div></ProtectedPage>);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('renders children when token is valid', async () => {
        const validToken = [
            'header',
            btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 })),
            'sig'
        ].join('.');
        localStorage.setItem('token', validToken);

        render(<ProtectedPage><div>Protected Content</div></ProtectedPage>);

        expect(await screen.findByText('Protected Content')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });
});
