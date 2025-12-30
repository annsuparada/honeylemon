import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Listing available IDs for seeding...\n');

  // List Categories
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log('📁 Categories:');
  if (categories.length === 0) {
    console.log('   No categories found\n');
  } else {
    categories.forEach((cat) => {
      console.log(`   ID: ${cat.id} | Name: ${cat.name} | Slug: ${cat.slug}`);
    });
    console.log('');
  }

  // List Authors/Users
  const authors = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
    },
    orderBy: { username: 'asc' },
  });

  console.log('👤 Authors/Users:');
  if (authors.length === 0) {
    console.log('   No authors found\n');
  } else {
    authors.forEach((author) => {
      console.log(`   ID: ${author.id} | Username: ${author.username} | Name: ${author.name || 'N/A'} | Email: ${author.email}`);
    });
    console.log('');
  }

  // List Tags
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log('🏷️  Tags:');
  if (tags.length === 0) {
    console.log('   No tags found\n');
  } else {
    tags.forEach((tag) => {
      console.log(`   ID: ${tag.id} | Name: ${tag.name} | Slug: ${tag.slug}`);
    });
    console.log('');
  }

  console.log('💡 Tip: Update the IDs in your JSON file with the IDs shown above.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

