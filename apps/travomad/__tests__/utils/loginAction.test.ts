/**
 * @jest-environment jsdom
 */

import { loginUser } from '@/utils/actions/loginAction';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
    jest.clearAllMocks();
});

describe('loginUser', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('logs in successfully and stores token/user', async () => {
        const mockToken = 'mock-jwt-token';
        const mockUser = { id: '1', email };

        // mock response from server
        fetchMock.mockResponseOnce(
            JSON.stringify({ token: mockToken, user: mockUser }),
            { status: 200 }
        );

        const storageEventSpy = jest.spyOn(window, 'dispatchEvent');

        const result = await loginUser(email, password);

        expect(result.success).toBe(true);
        expect(result.token).toBe(mockToken);

        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));

        // Check if storage event was dispatched
        expect(storageEventSpy).toHaveBeenCalledWith(expect.any(Event));
    });

    it('returns error message on invalid credentials', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({ message: 'Invalid credentials' }),
            { status: 401 }
        );

        const result = await loginUser(email, password);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid credentials');
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('handles server error gracefully', async () => {
        fetchMock.mockRejectOnce(new Error('Network error'));

        await expect(loginUser(email, password)).rejects.toThrow('Network error');
    });
});
