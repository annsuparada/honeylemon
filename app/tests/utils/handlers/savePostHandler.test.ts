import { handleSavePost } from "@/utils/handlers/savePostHandler"
import { PageType } from "@prisma/client"

describe('handleSavePost', () => {
    const baseParams = {
        title: 'Test Title',
        content: 'This is valid blog content.',
        description: 'Short description',
        excerpt: '',
        selectedCategory: 'cat1',
        image: '',
        heroImage: '',
        pageType: PageType.BLOG_POST,
        postId: null,
        slug: null,
        user: { id: 'user123' },
        isPublish: false,
        tagIds: [],
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

    describe('Page type validation', () => {
        it('prevents saving DESTINATION page type as draft', async () => {
            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: false,
            })

            expect(baseParams.setMessage).toHaveBeenCalledWith({
                type: 'error',
                text: 'Destination pages must be published to be accessible. Please use the "Publish" button instead.'
            })
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('prevents saving ITINERARY page type as draft', async () => {
            await handleSavePost({
                ...baseParams,
                pageType: PageType.ITINERARY,
                isPublish: false,
            })

            expect(baseParams.setMessage).toHaveBeenCalledWith({
                type: 'error',
                text: 'Itinerary pages must be published to be accessible. Please use the "Publish" button instead.'
            })
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('allows saving BLOG_POST as draft', async () => {
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'draft-slug' } })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.BLOG_POST,
                isPublish: false,
            })

            expect(baseParams.createPost).toHaveBeenCalled()
        })

        it('allows publishing DESTINATION page type', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, tags: [{ tag: { slug: 'thailand' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: true,
                tagIds: ['tag1'], // Required for DESTINATION pages
                tagSlug: 'thailand',
            })

            expect(baseParams.createPost).toHaveBeenCalled()
            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/thailand')
        })
    })

    describe('Tag validation for page types requiring single tag', () => {
        it('requires exactly 1 tag for DESTINATION page type', async () => {
            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: true,
                tagIds: [],
            })

            expect(baseParams.setMessage).toHaveBeenCalledWith({
                type: 'error',
                text: 'Destination pages require exactly 1 tag.'
            })
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('prevents multiple tags for DESTINATION page type', async () => {
            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: true,
                tagIds: ['tag1', 'tag2'],
            })

            expect(baseParams.setMessage).toHaveBeenCalledWith({
                type: 'error',
                text: 'Destination pages can only have 1 tag. Please remove extra tags.'
            })
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('allows exactly 1 tag for DESTINATION page type', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, tags: [{ tag: { slug: 'thailand' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: true,
                tagIds: ['tag1'],
                tagSlug: 'thailand',
            })

            expect(baseParams.createPost).toHaveBeenCalled()
        })

        it('allows multiple tags for BLOG_POST page type', async () => {
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'test-slug' } })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.BLOG_POST,
                isPublish: true,
                tagIds: ['tag1', 'tag2', 'tag3'],
            })

            expect(baseParams.createPost).toHaveBeenCalled()
        })
    })

    describe('Destination page routing', () => {
        it('redirects to destination route with tag slug when publishing DESTINATION post', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, tags: [{ tag: { slug: 'thailand' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: true,
                tagIds: ['tag1'],
                tagSlug: 'thailand',
            })

            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/thailand')
        })

        it('falls back to tag slug from API response if not provided', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: {
                    slug: 'test-slug',
                    type: PageType.DESTINATION,
                    tags: [{ tag: { slug: 'japan' } }]
                }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: true,
                tagIds: ['tag1'], // Required for DESTINATION pages
                tagSlug: undefined, // Not provided, should fallback to API response
            })

            // Verify createPost was called with correct data
            expect(baseParams.createPost).toHaveBeenCalled()
            expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
                tagIds: ['tag1'],
                type: PageType.DESTINATION,
                status: 'PUBLISHED',
            }))
            // Verify router was called with tag slug from API response
            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/japan')
        })

        it('normalizes tag slug to lowercase', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, tags: [{ tag: { slug: 'THAILAND' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                isPublish: true,
                tagIds: ['tag1'],
                tagSlug: 'THAILAND',
            })

            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/thailand')
        })
    })
})
