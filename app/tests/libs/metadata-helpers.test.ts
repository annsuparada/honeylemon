/**
 * @jest-environment node
 */

import {
  getTwitterMetadata,
  getRobotsMetadata,
  getOpenGraphImages,
  getCanonicalUrl,
  getBaseOpenGraph,
} from '@/app/lip/metadata-helpers';

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
});

