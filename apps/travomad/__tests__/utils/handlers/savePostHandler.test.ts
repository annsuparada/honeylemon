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
        it('prevents saving DESTINATION pillar page as draft', async () => {
            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: true,
                isPublish: false,
            })

            expect(baseParams.setMessage).toHaveBeenCalledWith({
                type: 'error',
                text: 'Destination pillar pages must be published to be accessible. Please use the "Publish" button instead.'
            })
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('allows saving DESTINATION non-pillar page as draft', async () => {
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'destination-draft-slug' } })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: false,
                tagIds: ['tag1'],
                isPublish: false,
            })

            expect(baseParams.createPost).toHaveBeenCalled()
            expect(baseParams.setMessage).not.toHaveBeenCalledWith(expect.objectContaining({
                type: 'error',
                text: expect.stringContaining('must be published')
            }))
        })

        it('prevents saving ITINERARY pillar page as draft', async () => {
            await handleSavePost({
                ...baseParams,
                pageType: PageType.ITINERARY,
                pillarPage: true,
                tagIds: ['tag1'],
                isPublish: false,
            })

            expect(baseParams.setMessage).toHaveBeenCalledWith({
                type: 'error',
                text: 'Itinerary pillar pages must be published to be accessible. Please use the "Publish" button instead.'
            })
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('allows saving ITINERARY non-pillar page as draft', async () => {
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'itinerary-draft-slug' } })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.ITINERARY,
                pillarPage: false,
                tagIds: ['tag1'],
                isPublish: false,
            })

            expect(baseParams.createPost).toHaveBeenCalled()
            expect(baseParams.setMessage).not.toHaveBeenCalledWith(expect.objectContaining({
                type: 'error',
                text: expect.stringContaining('must be published')
            }))
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

        it('allows publishing DESTINATION pillar page type', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, pillarPage: true, tags: [{ tag: { slug: 'thailand' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: true,
                isPublish: true,
                tagIds: ['tag1'], // Required for DESTINATION pages
                tagSlug: 'thailand',
            })

            expect(baseParams.createPost).toHaveBeenCalled()
            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/thailand')
        })

        it('redirects non-pillar DESTINATION pages to blog route', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, pillarPage: false, tags: [{ tag: { slug: 'mexico' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: false,
                isPublish: true,
                tagIds: ['tag1'],
                tagSlug: 'mexico',
            })

            expect(baseParams.createPost).toHaveBeenCalled()
            expect(baseParams.router.push).toHaveBeenCalledWith('/blog/test-slug')
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
        it('redirects pillar DESTINATION pages to destination route with tag slug', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, pillarPage: true, tags: [{ tag: { slug: 'thailand' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: true,
                isPublish: true,
                tagIds: ['tag1'],
                tagSlug: 'thailand',
            })

            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/thailand')
        })

        it('redirects non-pillar DESTINATION pages to blog route', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'non-pillar-slug', type: PageType.DESTINATION, pillarPage: false, tags: [{ tag: { slug: 'mexico' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: false,
                isPublish: true,
                tagIds: ['tag1'],
                tagSlug: 'mexico',
            })

            expect(baseParams.router.push).toHaveBeenCalledWith('/blog/non-pillar-slug')
        })

        it('falls back to tag slug from API response for pillar pages if not provided', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: {
                    slug: 'test-slug',
                    type: PageType.DESTINATION,
                    pillarPage: true,
                    tags: [{ tag: { slug: 'japan' } }]
                }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: true,
                isPublish: true,
                tagIds: ['tag1'], // Required for DESTINATION pages
                tagSlug: undefined, // Not provided, should fallback to API response
            })

            // Verify createPost was called with correct data
            expect(baseParams.createPost).toHaveBeenCalled()
            expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
                tagIds: ['tag1'],
                type: PageType.DESTINATION,
                pillarPage: true,
                status: 'PUBLISHED',
            }))
            // Verify router was called with tag slug from API response (for pillar pages)
            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/japan')
        })

        it('normalizes tag slug to lowercase for pillar pages', async () => {
            baseParams.createPost.mockResolvedValue({
                success: true,
                post: { slug: 'test-slug', type: PageType.DESTINATION, pillarPage: true, tags: [{ tag: { slug: 'THAILAND' } }] }
            })

            await handleSavePost({
                ...baseParams,
                pageType: PageType.DESTINATION,
                pillarPage: true,
                isPublish: true,
                tagIds: ['tag1'],
                tagSlug: 'THAILAND',
            })

            expect(baseParams.router.push).toHaveBeenCalledWith('/destinations/thailand')
        })
    })

    describe('Pillar page validation', () => {
        const originalFetch = global.fetch;

        beforeEach(() => {
            // Mock fetch for API calls
            global.fetch = jest.fn() as jest.Mock;
        });

        afterEach(() => {
            global.fetch = originalFetch;
        });

        it('allows BLOG_POST to be a pillar page', async () => {
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'blog-pillar-slug' } })

            await handleSavePost({
                ...baseParams,
                pillarPage: true,
                pageType: PageType.BLOG_POST,
                tagIds: [],
            })

            expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
                pillarPage: true,
                type: PageType.BLOG_POST,
            }))
            // BLOG_POST pillars don't check for duplicates (no API call)
            expect(global.fetch).not.toHaveBeenCalled()
        })

        it('prevents duplicate pillar pages for DESTINATION type', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ exists: true, message: 'A pillar page already exists' })
            });

            await handleSavePost({
                ...baseParams,
                pillarPage: true,
                pageType: PageType.DESTINATION,
                tagIds: ['tag1'],
                isPublish: true,
            })

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/check-pillar?type=DESTINATION&tagId=tag1')
            )
            expect(baseParams.setMessage).toHaveBeenCalledWith({
                type: 'error',
                text: 'A pillar page already exists for this destination. Only one pillar page is allowed per destination. Please edit the existing pillar or create a regular article instead.'
            })
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('allows creating new pillar page when none exists', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ exists: false, message: 'No pillar page exists' })
            });
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'pillar-slug' } })

            await handleSavePost({
                ...baseParams,
                pillarPage: true,
                pageType: PageType.DESTINATION,
                tagIds: ['tag1'],
                isPublish: true,
            })

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/check-pillar?type=DESTINATION&tagId=tag1')
            )
            expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
                pillarPage: true,
                type: PageType.DESTINATION,
                tagIds: ['tag1'],
            }))
        })

        it('allows editing existing pillar page (excludes current post from check)', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ exists: false, message: 'No pillar page exists' })
            });
            baseParams.updatePost.mockResolvedValue({ success: true, post: { slug: 'pillar-slug' } })

            await handleSavePost({
                ...baseParams,
                pillarPage: true,
                pageType: PageType.DESTINATION,
                tagIds: ['tag1'],
                postId: 'existing-post-id',
                isPublish: true,
            })

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/check-pillar?type=DESTINATION&tagId=tag1&excludePostId=existing-post-id')
            )
            expect(baseParams.updatePost).toHaveBeenCalled()
            expect(baseParams.createPost).not.toHaveBeenCalled()
        })

        it('allows saving when pillarPage is false even with same type and tag', async () => {
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'regular-slug' } })

            await handleSavePost({
                ...baseParams,
                pillarPage: false,
                pageType: PageType.DESTINATION,
                tagIds: ['tag1'],
                isPublish: true,
            })

            // Should not check for duplicates when pillarPage is false
            expect(global.fetch).not.toHaveBeenCalled()
            expect(baseParams.createPost).toHaveBeenCalled()
        })

        it('allows saving when pillarPage is true with ITINERARY page type and tag', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ exists: false, message: 'No pillar page exists' })
            });
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'itinerary-slug' } })

            await handleSavePost({
                ...baseParams,
                pillarPage: true,
                pageType: PageType.ITINERARY,
                tagIds: ['tag1'],
                isPublish: true,
            })

            expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
                pillarPage: true,
                type: PageType.ITINERARY,
            }))
        })

        it('allows saving when pillarPage is true with GUIDE page type and tag', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ exists: false, message: 'No pillar page exists' })
            });
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'guide-slug' } })

            await handleSavePost({
                ...baseParams,
                pillarPage: true,
                pageType: PageType.GUIDE,
                tagIds: ['tag1'],
                isPublish: true,
            })

            expect(baseParams.createPost).toHaveBeenCalledWith(expect.objectContaining({
                pillarPage: true,
                type: PageType.GUIDE,
            }))
        })

        it('handles API error gracefully when checking for duplicate pillar', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));
            baseParams.createPost.mockResolvedValue({ success: true, post: { slug: 'pillar-slug' } })

            // Should still allow save even if API check fails (graceful degradation)
            await handleSavePost({
                ...baseParams,
                pillarPage: true,
                pageType: PageType.DESTINATION,
                tagIds: ['tag1'],
                isPublish: true,
            })

            // Save should proceed (API error is logged but doesn't block)
            expect(baseParams.createPost).toHaveBeenCalled()
        })
    })
})
