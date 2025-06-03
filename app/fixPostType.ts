import { PrismaClient, PageType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find posts with null type (invalid per enum definition)
    const postsWithNullType = await prisma.post.findMany({
        where: {
            // Prisma doesn't support `null` enum values directly, so use raw query
            type: undefined as any, // This bypasses the enum restriction
        },
    });

    console.log(`Found ${postsWithNullType.length} posts with null type.`);

    for (const post of postsWithNullType) {
        await prisma.post.update({
            where: { id: post.id },
            data: { type: PageType.ARTICLE }, // or DEAL / DESTINATION
        });
        console.log(`✅ Updated post ${post.id}`);
    }

    console.log('🎉 All posts updated!');
}

main()
    .catch((e) => {
        console.error('Error fixing posts:', e);
    })
    .finally(() => prisma.$disconnect());
