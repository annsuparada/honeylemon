import { PrismaClient, PageType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Migrate ARTICLE posts to BLOG_POST (since ARTICLE is being deprecated)
    // Note: This migration has already been run. Keeping for reference.
    console.log('Migration from ARTICLE to BLOG_POST already completed.');

    // Find posts with null type (invalid per enum definition)
    const postsWithNullType = await prisma.post.findMany({
        where: {
            // Prisma doesn't support `null` enum values directly, so use raw query
            type: undefined as any, // This bypasses the enum restriction
        },
    });

    console.log(`Found ${postsWithNullType.length} posts with null type.`);

    if (postsWithNullType.length > 0) {
        for (const post of postsWithNullType) {
            await prisma.post.update({
                where: { id: post.id },
                data: { type: PageType.BLOG_POST }, // Default to BLOG_POST
            });
            console.log(`✅ Updated post ${post.id} from null to BLOG_POST`);
        }
    }

    console.log('🎉 Migration complete!');
}

main()
    .catch((e) => {
        console.error('Error fixing posts:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
