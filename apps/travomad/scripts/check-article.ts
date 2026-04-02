import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking seeded article...\n');

    // Try to find the article by slug
    const slug = 'best-hidden-gems-tuscany-travel-guide';

    const post = await prisma.post.findFirst({
        where: { slug },
        include: {
            category: {
                select: {
                    name: true,
                    slug: true,
                }
            },
            author: {
                select: {
                    username: true,
                    name: true,
                }
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            name: true,
                            slug: true,
                        }
                    }
                }
            },
            faqs: {
                orderBy: {
                    order: 'asc',
                }
            },
            itemListItems: {
                orderBy: {
                    order: 'asc',
                }
            },
        },
    });

    if (!post) {
        console.log(`❌ Article with slug "${slug}" not found`);
        process.exit(1);
    }

    console.log('✅ Article found!\n');
    console.log('📄 Article Details:');
    console.log(`   ID: ${post.id}`);
    console.log(`   Title: ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Type: ${post.type}`);
    console.log(`   Category: ${post.category.name} (${post.category.slug})`);
    console.log(`   Author: ${post.author.name || post.author.username}`);
    console.log(`   Featured: ${post.featured ? 'Yes' : 'No'}`);
    console.log(`   Trending: ${post.trending ? 'Yes' : 'No'}`);
    console.log(`   Pillar Page: ${post.pillarPage ? 'Yes' : 'No'}`);
    console.log(`   Read Time: ${post.readTime} min`);
    console.log(`   Word Count: ${post.wordCount} words`);
    console.log(`   Views: ${post.views}`);
    console.log(`   Published At: ${post.publishedAt ? new Date(post.publishedAt).toLocaleString() : 'Not published'}`);
    console.log(`   Created At: ${new Date(post.createdAt).toLocaleString()}`);
    console.log(`   Updated At: ${new Date(post.updatedAt).toLocaleString()}\n`);

    if (post.description) {
        console.log(`📝 Description: ${post.description}\n`);
    }

    if (post.excerpt) {
        console.log(`📄 Excerpt: ${post.excerpt}\n`);
    }

    if (post.metaTitle || post.metaDescription || post.focusKeyword) {
        console.log('🔍 SEO Fields:');
        if (post.metaTitle) console.log(`   Meta Title: ${post.metaTitle}`);
        if (post.metaDescription) console.log(`   Meta Description: ${post.metaDescription}`);
        if (post.focusKeyword) console.log(`   Focus Keyword: ${post.focusKeyword}`);
        console.log('');
    }

    if (post.tags.length > 0) {
        console.log(`🏷️  Tags (${post.tags.length}):`);
        post.tags.forEach((pt) => {
            console.log(`   - ${pt.tag.name} (${pt.tag.slug})`);
        });
        console.log('');
    }

    if (post.faqs.length > 0) {
        console.log(`❓ FAQs (${post.faqs.length}):`);
        post.faqs.forEach((faq, index) => {
            console.log(`   ${index + 1}. ${faq.question}`);
            console.log(`      ${faq.answer.substring(0, 80)}...`);
        });
        console.log('');
    }

    if (post.itemListItems.length > 0) {
        console.log(`📋 Item List Items (${post.itemListItems.length}):`);
        post.itemListItems.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.name} - ${item.url}`);
        });
        console.log('');
    }

    if (post.heroImage) {
        console.log(`🖼️  Hero Image: ${post.heroImage}`);
    }
    if (post.image) {
        console.log(`🖼️  Image: ${post.image}`);
    }

    console.log(`\n📊 Content Preview (first 200 chars):`);
    const contentPreview = post.content.replace(/<[^>]*>/g, '').substring(0, 200);
    console.log(`   ${contentPreview}...\n`);

    console.log('✅ All checks passed! Article is ready to use.');
    console.log(`\n💡 You can access this article at: /blog/${post.slug}`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

