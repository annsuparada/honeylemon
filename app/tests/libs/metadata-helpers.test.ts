/**
 * @jest-environment node
 */

import {
  getTwitterMetadata,
  getRobotsMetadata,
  getOpenGraphImages,
  getCanonicalUrl,
  getBaseOpenGraph,
  generatePostMetadata,
} from '@/app/lib/metadata-helpers';
import { BlogPost } from '@/app/types';

describe('metadata-helpers', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  describe('getTwitterMetadata', () => {
    it('returns correct Twitter metadata with all fields', () => {
      const result = getTwitterMetadata(
        'Test Title',
        'Test Description',
        'https://example.com/image.jpg'
      );

      expect(result).toEqual({
        card: 'summary_large_image',
        title: 'Test Title',
        description: 'Test Description',
        images: ['https://example.com/image.jpg'],
        creator: '@travomad',
        site: '@travomad',
      });
    });

    it('uses default image when imageUrl is not provided', () => {
      const result = getTwitterMetadata('Test Title', 'Test Description');

      expect(result.images).toEqual(['/default-og-image.jpg']);
    });

    it('uses default image when imageUrl is null', () => {
      const result = getTwitterMetadata('Test Title', 'Test Description', null);

      expect(result.images).toEqual(['/default-og-image.jpg']);
    });
  });

  describe('getRobotsMetadata', () => {
    it('returns index and follow when published', () => {
      const result = getRobotsMetadata(true);

      expect(result).toEqual({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      });
    });

    it('returns noindex and nofollow when not published', () => {
      const result = getRobotsMetadata(false);

      expect(result).toEqual({
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      });
    });

    it('defaults to published when no argument provided', () => {
      const result = getRobotsMetadata();

      expect(result.index).toBe(true);
      expect(result.follow).toBe(true);
    });
  });

  describe('getOpenGraphImages', () => {
    it('returns image array with provided imageUrl', () => {
      const result = getOpenGraphImages('https://example.com/image.jpg', 'Test Alt');

      expect(result).toEqual([
        {
          url: 'https://example.com/image.jpg',
          width: 1200,
          height: 630,
          alt: 'Test Alt',
          type: 'image/jpeg',
        },
      ]);
    });

    it('uses default image when imageUrl is not provided', () => {
      const result = getOpenGraphImages();

      expect(result[0].url).toBe('/default-og-image.jpg');
      expect(result[0].alt).toBe('Travomad');
    });

    it('uses default alt when alt is not provided', () => {
      const result = getOpenGraphImages('https://example.com/image.jpg');

      expect(result[0].alt).toBe('Travomad');
    });

    it('handles null imageUrl', () => {
      const result = getOpenGraphImages(null, 'Custom Alt');

      expect(result[0].url).toBe('/default-og-image.jpg');
      expect(result[0].alt).toBe('Custom Alt');
    });
  });

  describe('getCanonicalUrl', () => {
    it('returns canonical URL with NEXT_PUBLIC_API_URL', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://travomad.com';
      const result = getCanonicalUrl('/blog/test-post');

      expect(result).toEqual({
        canonical: 'https://travomad.com/blog/test-post',
      });
    });

    it('handles missing NEXT_PUBLIC_API_URL', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      const result = getCanonicalUrl('/blog/test-post');

      expect(result.canonical).toBe('undefined/blog/test-post');
    });
  });

  describe('getBaseOpenGraph', () => {
    it('returns correct Open Graph base properties', () => {
      const result = getBaseOpenGraph(
        'Test Title',
        'Test Description',
        'https://travomad.com/blog/test'
      );

      expect(result).toEqual({
        siteName: 'Travomad',
        locale: 'en_US',
        url: 'https://travomad.com/blog/test',
        title: 'Test Title',
        description: 'Test Description',
      });
    });

    it('handles empty strings', () => {
      const result = getBaseOpenGraph('', '', 'https://travomad.com');

      expect(result.title).toBe('');
      expect(result.description).toBe('');
    });
  });

  describe('generatePostMetadata', () => {
    const mockPost: BlogPost = {
      id: 'post123',
      title: 'Test Post Title',
      slug: 'test-post',
      content: '<p>Test content</p>',
      description: 'Test description',
      image: 'https://example.com/image.jpg',
      status: 'PUBLISHED',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      category: {
        name: 'Technology',
        slug: 'technology',
      },
      categoryId: 'cat123',
      author: {
        id: 'user123',
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        profilePicture: 'https://example.com/avatar.jpg',
      },
      tags: [
        { id: 'tag1', name: 'react', slug: 'react' },
        { id: 'tag2', name: 'nextjs', slug: 'nextjs' },
      ],
      type: 'ARTICLE',
      faqs: [],
      itemListItems: [],
    };

    const mockGetPost = jest.fn();

    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://travomad.com';
      jest.clearAllMocks();
    });

    it('generates correct metadata for a published post', async () => {
      mockGetPost.mockResolvedValue(mockPost);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(mockGetPost).toHaveBeenCalledWith('test-post');
      expect(result.title).toBe('Test Post Title | Travomad');
      expect(result.description).toBe('Test description');
      expect(result.keywords).toBe('Technology, react, nextjs, travel');
      expect(result.authors).toEqual([{ name: 'John Doe' }]);
      expect(result.creator).toBe('John Doe');
      expect(result.publisher).toBe('Travomad');
      expect(result.category).toBe('Technology');
    });

    it('uses default description when post description is missing', async () => {
      const postWithoutDescription = { ...mockPost, description: undefined };
      mockGetPost.mockResolvedValue(postWithoutDescription);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.description).toBe('Discover travel tips, destination guides, and exclusive deals on Travomad');
    });

    it('generates correct OpenGraph metadata', async () => {
      mockGetPost.mockResolvedValue(mockPost);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.openGraph).toEqual(
        expect.objectContaining({
          type: 'article',
          siteName: 'Travomad',
          locale: 'en_US',
          url: 'https://travomad.com/blog/test-post',
          title: 'Test Post Title',
          description: 'Test description',
          publishedTime: '2024-01-01T00:00:00.000Z',
          modifiedTime: '2024-01-02T00:00:00.000Z',
          authors: ['John Doe'],
          section: 'Technology',
          tags: ['Technology', 'react', 'nextjs'],
        })
      );
      expect(result.openGraph?.images).toBeDefined();
      const images = Array.isArray(result.openGraph?.images)
        ? result.openGraph.images
        : [result.openGraph?.images].filter(Boolean);
      expect(images).toHaveLength(1);
      const image = images[0];
      if (image && typeof image === 'object' && 'url' in image) {
        expect(image.url).toBe('https://example.com/image.jpg');
      }
    });

    it('generates correct Twitter metadata', async () => {
      mockGetPost.mockResolvedValue(mockPost);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.twitter).toEqual({
        card: 'summary_large_image',
        title: 'Test Post Title',
        description: 'Test description',
        images: ['https://example.com/image.jpg'],
        creator: '@travomad',
        site: '@travomad',
      });
    });

    it('generates correct canonical URL', async () => {
      mockGetPost.mockResolvedValue(mockPost);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.alternates).toEqual({
        canonical: 'https://travomad.com/blog/test-post',
      });
    });

    it('sets robots to index and follow for published posts', async () => {
      mockGetPost.mockResolvedValue(mockPost);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.robots).toEqual({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      });
    });

    it('sets robots to noindex and nofollow for non-published posts', async () => {
      const draftPost = { ...mockPost, status: 'DRAFT' as const };
      mockGetPost.mockResolvedValue(draftPost);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.robots).toEqual({
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      });
    });

    it('formats author name correctly when lastName is missing', async () => {
      const postWithoutLastName = {
        ...mockPost,
        author: { ...mockPost.author, lastName: undefined },
      };
      mockGetPost.mockResolvedValue(postWithoutLastName);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.authors).toEqual([{ name: 'John' }]);
      expect(result.creator).toBe('John');
    });

    it('handles different route prefixes correctly', async () => {
      mockGetPost.mockResolvedValue(mockPost);

      const blogResult = await generatePostMetadata('test-post', '/blog', mockGetPost);
      expect(blogResult.alternates?.canonical).toBe('https://travomad.com/blog/test-post');
      expect(blogResult.openGraph?.url).toBe('https://travomad.com/blog/test-post');

      const destResult = await generatePostMetadata('test-post', '/destinations', mockGetPost);
      expect(destResult.alternates?.canonical).toBe('https://travomad.com/destinations/test-post');
      expect(destResult.openGraph?.url).toBe('https://travomad.com/destinations/test-post');
    });

    it('returns not found metadata when post is null', async () => {
      mockGetPost.mockResolvedValue(null);

      const result = await generatePostMetadata('non-existent', '/blog', mockGetPost);

      expect(result).toEqual({
        title: 'Post Not Found',
        description: 'This post does not exist.',
      });
    });

    it('handles posts with empty tags array', async () => {
      const postWithoutTags = { ...mockPost, tags: [] };
      mockGetPost.mockResolvedValue(postWithoutTags);

      const result = await generatePostMetadata('test-post', '/blog', mockGetPost);

      expect(result.keywords).toBe('Technology, travel');
      expect((result.openGraph as any)?.tags).toEqual(['Technology']);
    });
  });
});

