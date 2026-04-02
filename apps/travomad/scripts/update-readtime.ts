import { PrismaClient } from '@prisma/client';
import { calculateReadTime, calculateWordCount } from '../app/lib/readTime-helpers';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting readTime and wordCount update for existing posts...\n');

    // Find all posts that need readTime/wordCount calculation
    // Get posts where readTime is null or wordCount is null
    const posts = await prisma.post.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            readTime: true,
            wordCount: true,
        },
    });

    console.log(`Found ${posts.length} total posts to check.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
        // Calculate readTime and wordCount
        const readTime = calculateReadTime(post.content);
        const wordCount = calculateWordCount(post.content);

        // Check if update is needed
        if (post.readTime === readTime && post.wordCount === wordCount) {
            skippedCount++;
            console.log(`⏭️  Skipped: "${post.title}" (already up to date)`);
            continue;
        }

        try {
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    readTime: readTime,
                    wordCount: wordCount,
                },
            });

            updatedCount++;
            console.log(`✅ Updated: "${post.title}" - ReadTime: ${readTime} min, WordCount: ${wordCount} words`);
        } catch (error) {
            console.error(`❌ Error updating post "${post.title}":`, error);
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total posts: ${posts.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log('\n🎉 Migration complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error running migration:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

