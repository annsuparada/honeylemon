import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WritePage from '@/app/write/page'
import '@testing-library/jest-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { createPost, updatePost, fetchPostBySlug } from '@/utils/postActions'
import { fetchAllCategories, createCategory } from '@/utils/categotyAction'
import handleSave from '@/app/write/page'

jest.mock('@/utils/postActions', () => ({
    createPost: jest.fn(),
    updatePost: jest.fn(),
    fetchPostBySlug: jest.fn(),
}))

jest.mock('@/utils/categotyAction', () => ({
    fetchAllCategories: jest.fn().mockResolvedValue([
        { id: 'cat1', name: 'Tech', slug: 'tech' },
        { id: 'cat2', name: 'Travel', slug: 'travel' },
    ]),
    createCategory: jest.fn(),
}))

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

jest.mock('@/app/components/ProtectedPage', () => ({ children }: any) => <div>{children}</div>)
jest.mock('@/app/components/AlertMessage', () => ({ message }: any) => <div>{message.text}</div>)
jest.mock('@/app/components/tiptap/MenuBar', () => () => <div>MenuBar</div>)
jest.mock('@tiptap/react', () => ({
    EditorProvider: ({ children }: any) => <div>{children}</div>,
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
        expect(screen.getByText(/save draft/i)).toBeInTheDocument()
        expect(screen.getByText(/publish/i)).toBeInTheDocument()
    })

    it('shows validation error if title is missing on publish', async () => {
        render(<WritePage />)
        fireEvent.click(screen.getByText(/publish/i))
        await waitFor(() => {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        })
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
            type: 'ARTICLE',
        }

            ; (fetchPostBySlug as jest.Mock).mockResolvedValue(mockPost)
            ; (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('?slug=existing-slug'))

        render(<WritePage />)

        await waitFor(() => {
            expect(screen.getByDisplayValue('Existing')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Existing Desc')).toBeInTheDocument()
        })
    })

    it('handles image input prompt', async () => {
        render(<WritePage />)

        const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('https://myimage.jpg')
        fireEvent.click(screen.getByText(/add image from url/i))

        expect(promptSpy).toHaveBeenCalledWith('Enter Image URL', expect.any(String))
        promptSpy.mockRestore()
    })
})
