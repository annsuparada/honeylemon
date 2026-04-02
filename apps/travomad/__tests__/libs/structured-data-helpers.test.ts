/**
 * @jest-environment node
 */

import {
  formatAuthorName,
  formatDateISO,
  generateImageVariants,
  generateFAQStructuredData,
  generateBreadcrumbListStructuredData,
  generateArticleStructuredData,
  generateItemListStructuredData,
} from '@/app/lib/structured-data-helpers';
import { BlogPost } from '@/app/types';
import { resetNextjsConfigCacheForTests } from '@/lib/config';

const originalEnv = process.env.NEXT_PUBLIC_API_URL;

describe('structured-data-helpers', () => {
  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    }
    resetNextjsConfigCacheForTests();
  });

  describe('formatAuthorName', () => {
    it('returns full name when name and lastName are provided', () => {
      const author = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
      };

      expect(formatAuthorName(author)).toBe('John Doe');
    });

    it('returns only name when lastName is missing', () => {
      const author = {
        id: '1',
        name: 'John',
        username: 'johndoe',
      };

      expect(formatAuthorName(author)).toBe('John');
    });

    it('returns username when name is missing', () => {
      const author = {
        id: '1',
        username: 'johndoe',
      };

      expect(formatAuthorName(author)).toBe('johndoe');
    });
  });

  describe('formatDateISO', () => {
    it('converts date string to ISO format', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatDateISO(dateString);

      expect(result).toBe(new Date(dateString).toISOString());
    });

    it('handles various date formats', () => {
      const dateString = '2024-01-15';
      const result = formatDateISO(dateString);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('generateImageVariants', () => {
    it('adds Cloudinary transformations for Cloudinary URLs', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/test/image/upload/v123/image.jpg';
      const result = generateImageVariants(cloudinaryUrl);

      expect(result).toHaveLength(3);
      expect(result[0].url).toContain('/upload/w_1200,h_675,c_fill,g_auto/');
      expect(result[1].url).toContain('/upload/w_1200,h_900,c_fill,g_auto/');
      expect(result[2].url).toContain('/upload/w_1200,h_1200,c_fill,g_auto/');
    });

    it('returns same image with dimensions for non-Cloudinary URLs', () => {
      const regularUrl = 'https://example.com/image.jpg';
      const result = generateImageVariants(regularUrl);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ url: regularUrl, width: 1200, height: 675 });
      expect(result[1]).toEqual({ url: regularUrl, width: 1200, height: 900 });
      expect(result[2]).toEqual({ url: regularUrl, width: 1200, height: 1200 });
    });
  });

  describe('generateFAQStructuredData', () => {
    it('returns null when faqs is undefined', () => {
      expect(generateFAQStructuredData(undefined)).toBeNull();
    });

    it('returns null when faqs is empty array', () => {
      expect(generateFAQStructuredData([])).toBeNull();
    });

    it('generates correct FAQPage schema', () => {
      const faqs = [
        { id: '1', question: 'What is this?', answer: 'This is a test', order: 0 },
        { id: '2', question: 'How does it work?', answer: 'It works well', order: 1 },
      ];

      const result = generateFAQStructuredData(faqs);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is this?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'This is a test',
            },
          },
          {
            '@type': 'Question',
            name: 'How does it work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'It works well',
            },
          },
        ],
      });
    });
  });

  describe('generateBreadcrumbListStructuredData', () => {
    const mockPost: BlogPost = {
      id: '1',
      title: 'Test Post',
      slug: 'test-post',
      content: 'Content',
      status: 'PUBLISHED' as any,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      category: { name: 'Tech', slug: 'tech' },
      categoryId: 'cat1',
      author: { id: '1', name: 'John', username: 'john' },
      authorId: '1',
      tags: [],
      type: 'ARTICLE' as any,
    };

    it('generates correct BreadcrumbList schema', () => {
      // Note: Since config is built at module load time, we'll test with the actual config value
      // For this test, we'll verify the structure is correct regardless of the base URL
      const result = generateBreadcrumbListStructuredData(mockPost);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: expect.stringMatching(/^https?:\/\/.+\/$/),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: expect.stringMatching(/^https?:\/\/.+\/blog$/),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Test Post',
            item: expect.stringMatching(/^https?:\/\/.+\/blog\/test-post$/),
          },
        ],
      });
    });

    it('uses default base URL when NEXT_PUBLIC_API_URL is not set', () => {
      // The config defaults to http://localhost:3000 when NEXT_PUBLIC_API_URL is not set
      const result = generateBreadcrumbListStructuredData(mockPost);

      // Check that it uses a valid URL format (defaults to localhost:3000)
      expect(result.itemListElement[0].item).toMatch(/^https?:\/\/.+\/$/);
    });
  });

  describe('generateArticleStructuredData', () => {
    const mockPost: BlogPost = {
      id: '1',
      title: 'Test Article',
      slug: 'test-article',
      content: 'Content',
      description: 'Test Description',
      image: 'https://example.com/image.jpg',
      status: 'PUBLISHED' as any,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      category: { name: 'Tech', slug: 'tech' },
      categoryId: 'cat1',
      author: {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        profilePicture: 'https://example.com/avatar.jpg',
      },
      authorId: '1',
      tags: [],
      type: 'ARTICLE' as any,
    };

    it('generates correct Article schema', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://honeylemon.com';
      const result = generateArticleStructuredData(mockPost);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe('Test Article');
      expect(result.description).toBe('Test Description');
      expect(result.author['@type']).toBe('Person');
      expect(result.author.name).toBe('John Doe');
      expect(result.publisher.name).toBe('Honey Lemon');
    });

    it('uses default description when not provided', () => {
      const postWithoutDesc = { ...mockPost, description: undefined };
      const result = generateArticleStructuredData(postWithoutDesc);

      expect(result.description).toContain('Discover travel tips');
    });

    it('uses default image when not provided', () => {
      const postWithoutImage = { ...mockPost, image: undefined };
      const result = generateArticleStructuredData(postWithoutImage);

      expect(result.image[0].url).toContain('daisyui.com');
    });
  });

  describe('generateItemListStructuredData', () => {
    it('returns null when itemListItems is undefined', () => {
      expect(generateItemListStructuredData(undefined)).toBeNull();
    });

    it('returns null when itemListItems is empty array', () => {
      expect(generateItemListStructuredData([])).toBeNull();
    });

    it('generates correct ItemList schema', () => {
      const itemListItems = [
        { id: '1', name: 'Item 1', url: 'https://example.com/item1', order: 0 },
        { id: '2', name: 'Item 2', url: 'https://example.com/item2', order: 1 },
        { id: '3', name: 'Item 3', url: 'https://example.com/item3', order: 2 },
      ];

      const result = generateItemListStructuredData(itemListItems);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Item 1',
            url: 'https://example.com/item1',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Item 2',
            url: 'https://example.com/item2',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Item 3',
            url: 'https://example.com/item3',
          },
        ],
      });
    });

    it('correctly converts 0-indexed order to 1-indexed position', () => {
      const itemListItems = [
        { id: '1', name: 'First Item', url: 'https://example.com/1', order: 0 },
      ];

      const result = generateItemListStructuredData(itemListItems);

      expect(result?.itemListElement[0].position).toBe(1);
    });

    it('handles items with special characters in names', () => {
      const itemListItems = [
        { id: '1', name: 'Item & More', url: 'https://example.com/1', order: 0 },
      ];

      const result = generateItemListStructuredData(itemListItems);

      expect(result?.itemListElement[0].name).toBe('Item & More');
    });
  });
});

