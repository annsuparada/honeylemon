/**
 * @jest-environment jsdom
 */

import {
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
} from '@/utils/userAction';

import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
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
            fetchMock.mockResponseOnce(
                JSON.stringify({ users: [mockUser] })
            );

            const result = await fetchUser();

            expect(Array.isArray(result)).toBe(true);
            expect(result[0].username).toBe('janedoe');
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/api/user'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token',
                    }),
                })
            );
        });

        it('fetches a single user by ID', async () => {
            fetchMock.mockResponseOnce(
                JSON.stringify({ users: [mockUser] })
            );

            const result = await fetchUser('u1');

            expect(result?.username).toBe('janedoe');
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/api/user?id=u1'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token',
                    }),
                })
            );
        });

        it('returns null on fetch error', async () => {
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
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token',
                    }),
                })
            );
        });

        it('returns null on creation failure', async () => {
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
                    method: 'PATCH',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token',
                    }),
                    body: JSON.stringify({
                        id: 'u1',
                        ...updateData,
                    }),
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

describe('deleteUser', () => {
    it('successfully deletes a user', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        const res = await deleteUser('jane@example.com');

        expect(res.success).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/user'),
            expect.objectContaining({
                method: 'DELETE',
                body: JSON.stringify({ email: 'jane@example.com' }),
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                }),
            })
        );
    });

    it('returns null on delete failure', async () => {
        fetchMock.mockRejectOnce(new Error('Delete failed'));
        const res = await deleteUser('jane@example.com');
        expect(res).toBeNull();
    });
});

describe('invalid or missing token', () => {
    beforeEach(() => {
        localStorage.clear(); // no token
    });

    it('handles missing token on fetchUser', async () => {
        fetchMock.mockRejectOnce(new Error('Unauthorized'));
        const res = await fetchUser('u1');
        expect(res).toBeNull();
    });

    it('handles missing token on updateUser', async () => {
        fetchMock.mockRejectOnce(new Error('Unauthorized'));
        const res = await updateUser('u1', { name: 'Test' });
        expect(res).toBeNull();
    });
});