import { handleSavePost } from "@/utils/handlers/savePostHandler"

describe('handleSavePost', () => {
    const baseParams = {
        title: 'Test Title',
        content: 'This is valid blog content.',
        description: 'Short description',
        selectedCategory: 'cat1',
        image: '',
        pageType: 'ARTICLE',
        postId: null,
        slug: null,
        user: { id: 'user123' },
        isPublish: false,
        createPost: jest.fn(),
        updatePost: jest.fn(),
        router: { push: jest.fn() },
        setMessage: jest.fn(),
        setLoading: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('successfully saves a draft and navigates to draft preview page', async () => {
        baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'draft-slug' } })

        await handleSavePost(baseParams)

        expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test Title',
            content: 'This is valid blog content.',
            status: 'DRAFT',
            authorId: 'user123'
        }))

        expect(baseParams.router.push).toHaveBeenCalledWith('/blog/draft/draft-slug')
        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'success', text: 'Post saved successfully!' })
    })

    it('successfully saves a draft without slug and navigates to dashboard', async () => {
        baseParams.createPost.mockResolvedValue({ success: true, post: {} })

        await handleSavePost(baseParams)

        expect(baseParams.router.push).toHaveBeenCalledWith('/dashboard/blogs')
        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'success', text: 'Post saved successfully!' })
    })

    it('successfully publishes a post and redirects to /blog/[slug]', async () => {
        baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'published-post' } });

        await handleSavePost({
            ...baseParams,
            isPublish: true // this is the difference
        });

        expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
            status: 'PUBLISHED'
        }));

        expect(baseParams.router.push).toHaveBeenCalledWith('/blog/published-post');
        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'success', text: 'Post saved successfully!' });
    });


    it('shows error if title is missing', async () => {
        await handleSavePost({ ...baseParams, title: '' })

        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'error', text: 'Title is required!' })
        expect(baseParams.createPost).not.toHaveBeenCalled()
    })

    it('shows error if category is missing', async () => {
        await handleSavePost({ ...baseParams, selectedCategory: '' })

        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'error', text: 'Category is required!' })
        expect(baseParams.createPost).not.toHaveBeenCalled()
    })

    it('shows error if content is too short', async () => {
        await handleSavePost({ ...baseParams, content: 'short' })

        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'error', text: 'Content must be at least 10 characters long!' })
        expect(baseParams.createPost).not.toHaveBeenCalled()
    })

    it('shows error if description is too long', async () => {
        const longDesc = 'x'.repeat(301)
        await handleSavePost({ ...baseParams, description: longDesc })

        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'error', text: 'Description must not be longer than 300 characters!' })
        expect(baseParams.createPost).not.toHaveBeenCalled()
    })

    it('handles failed post creation with validation error', async () => {
        baseParams.createPost.mockResolvedValue({ success: false, validationErrors: [{ message: 'Invalid data' }] })

        await handleSavePost(baseParams)

        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'error', text: 'Invalid data' })
    })

    it('handles post creation error gracefully', async () => {
        baseParams.createPost.mockRejectedValue(new Error('Server down'))

        await handleSavePost(baseParams)

        expect(baseParams.setMessage).toHaveBeenCalledWith({ type: 'error', text: 'An error occurred while saving the post.' })
    })
})
