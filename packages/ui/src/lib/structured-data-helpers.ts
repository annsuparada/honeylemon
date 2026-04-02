// Structured data helpers for SEO (JSON-LD schema markup)

import type { BlogPost } from '../types/blog';

function getPublicBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

function getSchemaBranding() {
  return {
    logoUrl:
      process.env.NEXT_PUBLIC_SCHEMA_LOGO_URL ??
      'https://res.cloudinary.com/dejr86qx8/image/upload/v1749171379/Travomad/Logo_Redesign_3_usuub1.png',
    publisherName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Honey Lemon',
    defaultArticleDescription:
      process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_DESCRIPTION ??
      'Discover travel tips, destination guides, and exclusive deals on Honey Lemon',
  };
}

const DEFAULT_IMAGE_URL =
  'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp';

export function formatAuthorName(author: BlogPost['author']): string {
  if (author.name) {
    return `${author.name}${author.lastName ? ' ' + author.lastName : ''}`;
  }
  return author.username;
}

export function formatDateISO(dateString: string): string {
  return new Date(dateString).toISOString();
}

export function generateImageVariants(
  imageUrl: string
): Array<{ url: string; width: number; height: number }> {
  if (imageUrl.includes('cloudinary.com')) {
    return [
      {
        url: `${imageUrl.replace(/\/upload\//, '/upload/w_1200,h_675,c_fill,g_auto/')}`,
        width: 1200,
        height: 675,
      },
      {
        url: `${imageUrl.replace(/\/upload\//, '/upload/w_1200,h_900,c_fill,g_auto/')}`,
        width: 1200,
        height: 900,
      },
      {
        url: `${imageUrl.replace(/\/upload\//, '/upload/w_1200,h_1200,c_fill,g_auto/')}`,
        width: 1200,
        height: 1200,
      },
    ];
  }
  return [
    { url: imageUrl, width: 1200, height: 675 },
    { url: imageUrl, width: 1200, height: 900 },
    { url: imageUrl, width: 1200, height: 1200 },
  ];
}

export function generateFAQStructuredData(faqs?: BlogPost['faqs']) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbListStructuredData(
  post: BlogPost,
  routePrefix: string = '/blog',
  countryName?: string,
  countrySlug?: string
) {
  const baseUrl = getPublicBaseUrl();
  const breadcrumbLabel =
    routePrefix === '/destinations'
      ? 'Destinations'
      : routePrefix === '/itineraries'
        ? 'Itineraries'
        : 'Blog';

  const articleUrl =
    routePrefix === '/destinations'
      ? `${baseUrl}${routePrefix}/post/${post.slug}`
      : `${baseUrl}${routePrefix}/${post.slug}`;

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${baseUrl}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: breadcrumbLabel,
      item: `${baseUrl}${routePrefix}`,
    },
  ];

  if (countryName && countrySlug) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: countryName,
      item: `${baseUrl}${routePrefix}/${countrySlug}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: post.title,
    item: articleUrl,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function generateArticleStructuredData(post: BlogPost) {
  const baseUrl = getPublicBaseUrl();
  const { logoUrl, publisherName, defaultArticleDescription } =
    getSchemaBranding();
  const authorName = formatAuthorName(post.author);
  const authorUrl = `${baseUrl}/author/${post.author.username || post.author.id}`;
  const baseImage = post.heroImage || post.image || DEFAULT_IMAGE_URL;
  const articleImages = generateImageVariants(baseImage);
  const authorImage = post.author.profilePicture || logoUrl;

  const articleData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || defaultArticleDescription,
    image: articleImages.map((img) => ({
      '@type': 'ImageObject',
      url: img.url,
      width: img.width,
      height: img.height,
    })),
    datePublished: formatDateISO(post.publishedAt || post.createdAt),
    dateModified: formatDateISO(post.updatedAt),
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
      image: authorImage,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
  };

  if (post.readTime !== undefined && post.readTime !== null) {
    articleData.timeRequired = `PT${post.readTime}M`;
  }

  return articleData;
}

export function generateItemListStructuredData(
  itemListItems?: BlogPost['itemListItems']
) {
  if (!itemListItems || itemListItems.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: itemListItems.map((item) => ({
      '@type': 'ListItem',
      position: item.order + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
