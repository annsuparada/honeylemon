/**
 * @jest-environment jsdom
 */

import {
    fetchAllCategories,
    fetchCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory
} from '@/utils/categoryAction';

import { categorySchema } from '@/schemas/categorySchema';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
    fetchMock.resetMocks();
});

describe('Category Actions', () => {
    describe('fetchAllCategories', () => {
        it('returns categories on success', async () => {
            const mockCategories = [{ id: '1', name: 'Tech' }, { id: '2', name: 'Art' }];
            fetchMock.mockResponseOnce(JSON.stringify({ categories: mockCategories }));

            const result = await fetchAllCategories();
            expect(result).toEqual(mockCategories);
        });

        it('returns empty array on fetch error', async () => {
            fetchMock.mockRejectOnce(new Error('Network error'));
            const result = await fetchAllCategories();
            expect(result).toEqual([]);
        });

        it('returns empty array on bad status', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ error: 'Failed' }), { status: 500 });
            const result = await fetchAllCategories();
            expect(result).toEqual([]);
        });
    });

    describe('fetchCategoryBySlug', () => {
        it('returns category on success', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ category: { name: 'Science', slug: 'science' } }));
            const result = await fetchCategoryBySlug('science');
            expect(result?.slug).toBe('science');
        });

        it('returns null on not found', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ category: null }));
            const result = await fetchCategoryBySlug('missing');
            expect(result).toBeNull();
        });

        it('returns null on error', async () => {
            fetchMock.mockRejectOnce(new Error('Bad'));
            const result = await fetchCategoryBySlug('anything');
            expect(result).toBeNull();
        });
    });

    describe('createCategory', () => {
        it('creates a category successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ category: { name: 'Books', slug: 'books' } }));

            const result = await createCategory('Books', 'test-token');
            expect(result?.name).toBe('Books');
            expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: 'Bearer test-token'
                })
            }));
        });

        it('returns null on API error', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ error: 'Failed' }), { status: 500 });
            const result = await createCategory('Broken', 'bad-token');
            expect(result).toBeNull();
        });

        it('returns null on fetch failure', async () => {
            fetchMock.mockRejectOnce(new Error('Network fail'));
            const result = await createCategory('Any', 'token');
            expect(result).toBeNull();
        });
    });

    describe('updateCategory', () => {
        it('updates a category successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ category: { id: '1', name: 'New Name' } }));
            const result = await updateCategory('1', 'New Name', 'token');
            expect(result?.name).toBe('New Name');
        });

        it('returns null on failure', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ error: 'Nope' }), { status: 400 });
            const result = await updateCategory('1', 'X', 'token');
            expect(result).toBeNull();
        });
    });

    describe('deleteCategory', () => {
        it('returns true on success', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
            const result = await deleteCategory('1', 'token');
            expect(result).toBe(true);
        });

        it('returns false on API error', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ error: 'fail' }), { status: 500 });
            const result = await deleteCategory('1', 'token');
            expect(result).toBe(false);
        });

        it('returns false on fetch error', async () => {
            fetchMock.mockRejectOnce(new Error('Network error'));
            const result = await deleteCategory('1', 'token');
            expect(result).toBe(false);
        });
    });

    describe('categorySchema validation', () => {
        it('validates correct category', () => {
            const valid = { name: 'Technology' };
            const result = categorySchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('fails on short name', () => {
            const invalid = { name: 'AB' };
            const result = categorySchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });
    });
});
