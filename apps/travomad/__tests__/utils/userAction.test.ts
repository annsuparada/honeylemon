/**
 * @jest-environment jsdom
 */

import {
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
} from '@/utils/actions/userAction';

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

describe('changePassword', () => {
    const userId = 'u1';
    const currentPassword = 'oldpass123';
    const newPassword = 'newpass456';

    beforeEach(() => {
        fetchMock.resetMocks();
        localStorage.setItem('token', 'mock-token');
    });

    it('successfully changes password', async () => {
        const mockResponse = { success: true, message: 'Password updated successfully' };
        fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

        const result = await changePassword(userId, currentPassword, newPassword);

        expect(result).toEqual(mockResponse);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/password'),
            expect.objectContaining({
                method: 'PATCH',
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({
                    userId,
                    currentPassword,
                    newPassword,
                }),
            })
        );
    });

    it('returns error message from server response', async () => {
        const mockError = { message: 'Current password is incorrect' };
        fetchMock.mockResponseOnce(JSON.stringify(mockError), { status: 401 });

        const result = await changePassword(userId, currentPassword, newPassword);

        expect(result).toEqual(mockError);
    });

    it('returns null if fetch throws error', async () => {
        fetchMock.mockRejectOnce(new Error('Network error'));

        const result = await changePassword(userId, currentPassword, newPassword);

        expect(result).toBeNull();
    });

    it('returns null if token is missing', async () => {
        localStorage.removeItem('token');
        fetchMock.mockRejectOnce(new Error('Unauthorized'));

        const result = await changePassword(userId, currentPassword, newPassword);

        expect(result).toBeNull();
    });

    it('sends correct headers and body', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        await changePassword(userId, currentPassword, newPassword);

        const [url, options] = fetchMock.mock.calls[0];

        expect(url).toMatch('/password');
        expect(options?.method).toBe('PATCH');
        expect(options?.headers).toMatchObject({
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
        });
        expect(options?.body).toBe(
            JSON.stringify({ userId, currentPassword, newPassword })
        );
    });
});
