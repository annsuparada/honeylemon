import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WritePage from '@/app/write/page'
import '@testing-library/jest-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageType } from '@prisma/client'
import { createPost, updatePost, fetchPostBySlug } from '@/utils/actions/postActions'
import { fetchAllCategories, createCategory } from '@/utils/actions/categoryAction'

jest.mock('@honeylemon/ui/pages/ProtectedPage', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/utils/actions/postActions', () => ({
    createPost: jest.fn(),
    updatePost: jest.fn(),
    fetchPostBySlug: jest.fn(),
}))

jest.mock('@/utils/actions/categoryAction', () => ({
    fetchAllCategories: jest.fn().mockResolvedValue([
        { id: 'cat1', name: 'Tech', slug: 'tech' },
        { id: 'cat2', name: 'Travel', slug: 'travel' },
    ]),
    createCategory: jest.fn(),
}))

jest.mock('@/utils/actions/tagAction', () => ({
    fetchAllTags: jest.fn().mockResolvedValue([]),
    createTag: jest.fn(),
}))

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

jest.mock('@honeylemon/ui', () => {
    const actual = jest.requireActual('@honeylemon/ui');
    return {
        ...actual,
        ProtectedPage: ({ children }: any) => <div>{children}</div>,
        AlertMessage: ({ message }: any) => <div>{message.text}</div>,
        MenuBar: () => <div>MenuBar</div>,
    };
})
jest.mock('@tiptap/react', () => ({
    EditorProvider: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/utils/helpers/pillarPageHelpers', () => ({
    checkPillarExists: jest.fn(),
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn((key) => {
            if (key === 'user') return JSON.stringify({ id: 'u1', name: 'Jane' })
            if (key === 'token') return 'mock-token'
            return null
        }),
    },
    writable: true,
})

describe('WritePage Component', () => {
    const push = jest.fn()

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push })
            ; (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders form UI correctly', async () => {
        render(<WritePage />)
        expect(await screen.findByText(/write your blog/i)).toBeInTheDocument()
        // There may be multiple publish buttons (MenuBar and page), so use getAllByText
        expect(screen.getAllByText(/publish/i).length).toBeGreaterThan(0)
        // Save Draft button should be visible for BLOG_POST (default page type)
        expect(screen.getByText(/save draft/i)).toBeInTheDocument()
    })

    it('shows validation error if title is missing on publish', async () => {
        render(<WritePage />)
        // Get all publish buttons and click the last one (the actual publish button from the page)
        const publishButtons = screen.getAllByText(/publish/i)
        fireEvent.click(publishButtons[publishButtons.length - 1]) // Click the last publish button (from the page)
        await waitFor(() => {
            // Check for the error message (case insensitive)
            expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        }, { timeout: 3000 })
    })

    it('loads existing post if slug is provided', async () => {
        const mockPost = {
            id: '123',
            title: 'Existing',
            description: 'Existing Desc',
            content: 'Content',
            slug: 'existing-slug',
            image: 'https://image.jpg',
            categoryId: 'cat1',
            type: PageType.BLOG_POST,
        }

            ; (fetchPostBySlug as jest.Mock).mockResolvedValue(mockPost)
            ; (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('?slug=existing-slug'))

        render(<WritePage />)

        await waitFor(() => {
            expect(screen.getByDisplayValue('Existing')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Existing Desc')).toBeInTheDocument()
        })
    })

    // Note: Image upload is now handled via ImageUploadModal in MenuBar, not via prompt
    // This test is no longer relevant as we removed the "Add Image from URL" button
    // Image upload functionality is tested in ImageUploadModal.test.tsx
})
