/**
 * @jest-environment jsdom
 */

import {
    fetchUser,
    createUser,
    updateUser,
} from '@/utils/userAction'; // adjust the path if necessary

import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
    fetchMock.resetMocks();
});

describe('userActions', () => {
    const mockUser = {
        id: 'u1',
        name: 'Jane',
        lastName: 'Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        role: 'USER',
    };

    describe('fetchUser', () => {
        it('fetches all users when no ID is provided', async () => {
            fetchMock.mockResponseOnce(JSON.stringify([mockUser]));

            const result = await fetchUser();

            expect(Array.isArray(result)).toBe(true);
            expect(result[0].username).toBe('janedoe');
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/api/user')
            );
        });

        it('fetches a single user by ID', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockUser));

            const result = await fetchUser('u1');

            expect(result.username).toBe('janedoe');
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/api/user?id=u1')
            );
        });

        it('returns null on error', async () => {
            fetchMock.mockRejectOnce(new Error('Network error'));
            const result = await fetchUser('u1');
            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        const newUser = {
            username: 'newuser',
            email: 'new@example.com',
            password: 'password123',
        };

        it('creates a user successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

            const res = await createUser(newUser);

            expect(res.success).toBe(true);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/api/user'),
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });

        it('returns null on failure', async () => {
            fetchMock.mockRejectOnce(new Error('Fail'));
            const res = await createUser(newUser);
            expect(res).toBeNull();
        });
    });

    describe('updateUser', () => {
        const updateData = {
            name: 'Updated Name',
            email: 'updated@example.com',
        };

        it('updates a user successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

            const res = await updateUser('u1', updateData);

            expect(res.success).toBe(true);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/api/user'),
                expect.objectContaining({
                    method: 'PUT',
                })
            );
        });

        it('returns null on update error', async () => {
            fetchMock.mockRejectOnce(new Error('Fail'));
            const res = await updateUser('u1', updateData);
            expect(res).toBeNull();
        });
    });
});
