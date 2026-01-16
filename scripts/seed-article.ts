import { PrismaClient, PageType, PostStatus } from '@prisma/client';
import { calculateReadTime, calculateWordCount } from '../app/lib/readTime-helpers';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ArticleSeed {
  title: string;
  slug?: string;
  content: string;
  description?: string;
  excerpt?: string;
  image?: string;
  heroImage?: string;
  categoryId: string;
  authorId: string;
  type: PageType;
  status?: PostStatus;
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  featured?: boolean;
  pillarPage?: boolean;
  trending?: boolean;
  publishedAt?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  itemListItems?: Array<{
    name: string;
    url: string;
  }>;
}

async function main() {
  console.log('🌱 Starting article seed...\n');

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'example-article-seed.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: File not found at ${jsonPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const articleData: ArticleSeed = JSON.parse(fileContent);

  // Validate required fields
  if (!articleData.title || !articleData.content || !articleData.categoryId || !articleData.authorId || !articleData.type) {
    console.error('❌ Error: Missing required fields (title, content, categoryId, authorId, type)');
    process.exit(1);
  }

  // Generate slug if not provided
  if (!articleData.slug) {
    articleData.slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Check if slug already exists
  const existingPost = await prisma.post.findFirst({
    where: { slug: articleData.slug }
  });

  if (existingPost) {
    console.error(`❌ Error: Post with slug "${articleData.slug}" already exists`);
    process.exit(1);
  }

  // Verify category exists
  const category = await prisma.category.findFirst({
    where: { id: articleData.categoryId }
  });

  if (!category) {
    console.error(`❌ Error: Category with ID "${articleData.categoryId}" not found`);
    process.exit(1);
  }

  // Verify author exists
  const author = await prisma.user.findFirst({
    where: { id: articleData.authorId }
  });

  if (!author) {
    console.error(`❌ Error: Author with ID "${articleData.authorId}" not found`);
    process.exit(1);
  }

  // Verify tags exist if provided
  if (articleData.tagIds && articleData.tagIds.length > 0) {
    const tags = await prisma.tag.findMany({
      where: { id: { in: articleData.tagIds } }
    });

    if (tags.length !== articleData.tagIds.length) {
      const foundIds = tags.map(t => t.id);
      const missingIds = articleData.tagIds.filter(id => !foundIds.includes(id));
      console.error(`❌ Error: Tags with IDs ${missingIds.join(', ')} not found`);
      process.exit(1);
    }
  }

  // Calculate readTime and wordCount
  const readTime = calculateReadTime(articleData.content);
  const wordCount = calculateWordCount(articleData.content);

  console.log(`📝 Creating post: "${articleData.title}"`);
  console.log(`   Slug: ${articleData.slug}`);
  console.log(`   Category: ${category.name}`);
  console.log(`   Author: ${author.username}`);
  console.log(`   Type: ${articleData.type}`);
  console.log(`   Status: ${articleData.status || 'DRAFT'}`);
  console.log(`   Read Time: ${readTime} min`);
  console.log(`   Word Count: ${wordCount} words\n`);

  try {
    // Create the post
    const newPost = await prisma.post.create({
      data: {
        title: articleData.title,
        slug: articleData.slug,
        content: articleData.content,
        description: articleData.description || null,
        excerpt: articleData.excerpt || null,
        image: articleData.image || null,
        heroImage: articleData.heroImage || null,
        categoryId: articleData.categoryId,
        authorId: articleData.authorId,
        status: articleData.status || PostStatus.DRAFT,
        type: articleData.type,
        metaTitle: articleData.metaTitle || null,
        metaDescription: articleData.metaDescription || null,
        focusKeyword: articleData.focusKeyword || null,
        featured: articleData.featured || false,
        pillarPage: articleData.pillarPage || false,
        trending: articleData.trending || false,
        publishedAt: articleData.publishedAt ? new Date(articleData.publishedAt) : null,
        readTime: readTime,
        wordCount: wordCount,
        tags: articleData.tagIds && articleData.tagIds.length > 0 ? {
          create: articleData.tagIds.map((tagId: string) => ({
            tagId: tagId,
          })),
        } : undefined,
        faqs: articleData.faqs && articleData.faqs.length > 0 ? {
          create: articleData.faqs.map((faq: any, index: number) => ({
            question: faq.question,
            answer: faq.answer,
            order: index,
          })),
        } : undefined,
        itemListItems: articleData.itemListItems && articleData.itemListItems.length > 0 ? {
          create: articleData.itemListItems.map((item: any, index: number) => ({
            name: item.name,
            url: item.url,
            order: index,
          })),
        } : undefined,
      },
      include: {
        category: true,
        author: {
          select: {
            username: true,
            name: true,
          }
        },
        tags: {
          include: {
            tag: true,
          }
        },
        faqs: true,
        itemListItems: true,
      },
    });

    console.log('✅ Post created successfully!\n');
    console.log('📊 Post Details:');
    console.log(`   ID: ${newPost.id}`);
    console.log(`   Title: ${newPost.title}`);
    console.log(`   Slug: ${newPost.slug}`);
    console.log(`   Status: ${newPost.status}`);
    console.log(`   Tags: ${newPost.tags.length}`);
    console.log(`   FAQs: ${newPost.faqs.length}`);
    console.log(`   Item List Items: ${newPost.itemListItems.length}`);
    console.log('\n🎉 Seed complete!');
  } catch (error) {
    console.error('❌ Error creating post:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error running seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

