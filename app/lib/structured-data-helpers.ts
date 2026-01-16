// Structured data helpers for SEO (JSON-LD schema markup)

import { BlogPost } from '@/app/types';

const DEFAULT_LOGO_URL = 'https://res.cloudinary.com/dejr86qx8/image/upload/v1749171379/Travomad/Logo_Redesign_3_usuub1.png';
const DEFAULT_IMAGE_URL = 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp';
const DEFAULT_BASE_URL = 'https://travomad.vercel.app';

/**
 * Format author name from post author data
 */
export function formatAuthorName(author: BlogPost['author']): string {
  if (author.name) {
    return `${author.name}${author.lastName ? ' ' + author.lastName : ''}`;
  }
  return author.username;
}

/**
 * Format date to ISO 8601 format
 */
export function formatDateISO(dateString: string): string {
  return new Date(dateString).toISOString();
}

/**
 * Generate image variants in different aspect ratios (16:9, 4:3, 1:1)
 * For Cloudinary images, adds transformations. For other sources, uses the same image.
 * Minimum 1200px wide requirement, at least 50K pixels (1200x675 = 810K pixels ✓)
 */
export function generateImageVariants(imageUrl: string): Array<{ url: string; width: number; height: number }> {
  // If it's a Cloudinary URL, add transformations for different aspect ratios
  if (imageUrl.includes('cloudinary.com')) {
    return [
      {
        url: `${imageUrl.replace(/\/upload\//, '/upload/w_1200,h_675,c_fill,g_auto/')}`,
        width: 1200,
        height: 675 // 16:9 aspect ratio
      },
      {
        url: `${imageUrl.replace(/\/upload\//, '/upload/w_1200,h_900,c_fill,g_auto/')}`,
        width: 1200,
        height: 900 // 4:3 aspect ratio
      },
      {
        url: `${imageUrl.replace(/\/upload\//, '/upload/w_1200,h_1200,c_fill,g_auto/')}`,
        width: 1200,
        height: 1200 // 1:1 aspect ratio
      }
    ];
  }
  // For non-Cloudinary images, return the same image 3 times with proper dimensions
  // Note: In production, you might want to generate actual variants using an image service
  return [
    { url: imageUrl, width: 1200, height: 675 }, // 16:9
    { url: imageUrl, width: 1200, height: 900 }, // 4:3
    { url: imageUrl, width: 1200, height: 1200 } // 1:1
  ];
}

/**
 * Generate FAQPage structured data
 */
export function generateFAQStructuredData(faqs?: BlogPost['faqs']) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbListStructuredData(
  post: BlogPost,
  routePrefix: string = '/blog',
  countryName?: string,
  countrySlug?: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL;

  // Determine breadcrumb label based on route prefix
  const breadcrumbLabel = routePrefix === '/destinations' ? 'Destinations' :
    routePrefix === '/itineraries' ? 'Itineraries' :
      'Blog';

  // Determine article URL - use /post/ for destinations to avoid conflicts
  const articleUrl = routePrefix === '/destinations'
    ? `${baseUrl}${routePrefix}/post/${post.slug}`
    : `${baseUrl}${routePrefix}/${post.slug}`;

  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${baseUrl}/`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": breadcrumbLabel,
      "item": `${baseUrl}${routePrefix}`
    }
  ];

  // Add country if provided
  if (countryName && countrySlug) {
    items.push({
      "@type": "ListItem",
      "position": items.length + 1,
      "name": countryName,
      "item": `${baseUrl}${routePrefix}/${countrySlug}`
    });
  }

  // Add post title
  items.push({
    "@type": "ListItem",
    "position": items.length + 1,
    "name": post.title,
    "item": articleUrl
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

/**
 * Generate Article structured data
 */
export function generateArticleStructuredData(post: BlogPost) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL;
  const authorName = formatAuthorName(post.author);
  const authorUrl = `${baseUrl}/author/${post.author.username || post.author.id}`;
  const baseImage = post.heroImage || post.image || DEFAULT_IMAGE_URL;
  const articleImages = generateImageVariants(baseImage);
  const authorImage = post.author.profilePicture || DEFAULT_LOGO_URL;

  const articleData: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description || "Discover travel tips, destination guides, and exclusive deals on Travomad",
    "image": articleImages.map(img => ({
      "@type": "ImageObject",
      "url": img.url,
      "width": img.width,
      "height": img.height
    })),
    "datePublished": formatDateISO(post.publishedAt || post.createdAt),
    "dateModified": formatDateISO(post.updatedAt),
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": authorUrl,
      "image": authorImage
    },
    "publisher": {
      "@type": "Organization",
      "name": "Travomad",
      "logo": {
        "@type": "ImageObject",
        "url": DEFAULT_LOGO_URL
      }
    }
  };

  // Add timeRequired (read time) if available
  if (post.readTime !== undefined && post.readTime !== null) {
    articleData.timeRequired = `PT${post.readTime}M`;
  }

  return articleData;
}

/**
 * Generate ItemList structured data
 */
export function generateItemListStructuredData(itemListItems?: BlogPost['itemListItems']) {
  if (!itemListItems || itemListItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": itemListItems.map(item => ({
      "@type": "ListItem",
      "position": item.order + 1, // Position is 1-indexed
      "name": item.name,
      "url": item.url
    }))
  };
}

