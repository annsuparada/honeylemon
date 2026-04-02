import { PageType, PostStatus, type PrismaClient } from "@prisma/client";
import { postSchema, updatePostSchema } from "@honeylemon/cms";
import { z } from "zod";
import { calculateReadTime, calculateWordCount } from "./read-time";

export interface PostFilter {
    slug?: string;
    status?: PostStatus;
    type?: PageType;
    categoryId?: string;
    featured?: boolean;
    trending?: boolean;
}

export interface PostQueryParams {
    slug?: string;
    status?: PostStatus;
    category?: string;
    limit?: number;
    type?: PageType;
    featured?: boolean;
    trending?: boolean;
}

export function createPostService(deps: { prisma: PrismaClient }) {
    const { prisma } = deps;

    async function buildPostFilter(
        params: PostQueryParams
    ): Promise<PostFilter | null> {
        const filter: PostFilter = {};

        if (params.slug) filter.slug = params.slug;
        if (params.status) filter.status = params.status;
        if (params.type) filter.type = params.type;
        if (params.featured === true) filter.featured = true;
        if (params.trending === true) filter.trending = true;

        if (params.category) {
            const category = await prisma.category.findFirst({
                where: { slug: params.category },
                select: { id: true },
            });

            if (category) {
                filter.categoryId = category.id;
            } else {
                return null;
            }
        }

        return filter;
    }

    async function getPosts(filter: PostFilter, limit?: number) {
        const rawPosts = await prisma.post.findMany({
            where: filter,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        name: true,
                        lastName: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                faqs: {
                    select: {
                        id: true,
                        question: true,
                        answer: true,
                        order: true,
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
                itemListItems: {
                    select: {
                        id: true,
                        name: true,
                        url: true,
                        order: true,
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit && !isNaN(limit) ? limit : undefined,
        });

        const posts = rawPosts.map((post) => ({
            ...post,
            tags: post.tags.map((pt) => ({
                id: pt.tag.id,
                name: pt.tag.name,
                slug: pt.tag.slug,
            })),
            faqs: post.faqs || [],
            itemListItems: post.itemListItems || [],
        }));

        return posts;
    }

    async function postSlugExists(slug: string): Promise<boolean> {
        const existingPost = await prisma.post.findFirst({
            where: { slug },
        });
        return !!existingPost;
    }

    async function createPost(
        data: z.infer<typeof postSchema>,
        authorId: string
    ) {
        if (data.slug) {
            const exists = await postSlugExists(data.slug);
            if (exists) {
                throw new Error("Slug already exists");
            }
        }

        if (!data.slug) {
            throw new Error("Slug is required");
        }

        const readTime = calculateReadTime(data.content);
        const wordCount = calculateWordCount(data.content);

        const newPost = await prisma.post.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                description: data.description || "",
                excerpt: data.excerpt || null,
                image: data.image || "",
                heroImage: data.heroImage || null,
                categoryId: data.categoryId,
                authorId: authorId,
                status: data.status ?? "DRAFT",
                type: data.type,
                metaTitle: data.metaTitle || null,
                metaDescription: data.metaDescription || null,
                focusKeyword: data.focusKeyword || null,
                featured: data.featured || false,
                pillarPage: data.pillarPage || false,
                trending: data.trending || false,
                publishedAt: data.publishedAt
                    ? typeof data.publishedAt === "string"
                        ? new Date(data.publishedAt)
                        : data.publishedAt
                    : null,
                readTime: readTime,
                wordCount: wordCount,
                tags:
                    data.tagIds && data.tagIds.length > 0
                        ? {
                              create: data.tagIds.map((tagId: string) => ({
                                  tagId: tagId,
                              })),
                          }
                        : undefined,
                faqs:
                    data.faqs && data.faqs.length > 0
                        ? {
                              create: data.faqs.map(
                                  (faq: { question: string; answer: string }, index: number) => ({
                                      question: faq.question,
                                      answer: faq.answer,
                                      order: index,
                                  })
                              ),
                          }
                        : undefined,
                itemListItems:
                    data.itemListItems && data.itemListItems.length > 0
                        ? {
                              create: data.itemListItems.map(
                                  (
                                      item: { name: string; url: string },
                                      index: number
                                  ) => ({
                                      name: item.name,
                                      url: item.url,
                                      order: index,
                                  })
                              ),
                          }
                        : undefined,
            },
            include: {
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });

        return newPost;
    }

    async function getPostById(id: string) {
        return await prisma.post.findFirst({
            where: { id },
        });
    }

    async function updatePost(data: z.infer<typeof updatePostSchema>) {
        const post = await getPostById(data.id);
        if (!post) {
            throw new Error("Post not found");
        }

        if (data.tagIds !== undefined) {
            await prisma.postTag.deleteMany({
                where: { postId: data.id },
            });

            if (data.tagIds.length > 0) {
                await prisma.postTag.createMany({
                    data: data.tagIds.map((tagId: string) => ({
                        postId: data.id,
                        tagId: tagId,
                    })),
                });
            }
        }

        if (data.faqs !== undefined) {
            await prisma.fAQ.deleteMany({
                where: { postId: data.id },
            });

            if (data.faqs.length > 0) {
                await prisma.fAQ.createMany({
                    data: data.faqs.map(
                        (faq: { question: string; answer: string }, index: number) => ({
                            postId: data.id,
                            question: faq.question,
                            answer: faq.answer,
                            order: index,
                        })
                    ),
                });
            }
        }

        if (data.itemListItems !== undefined) {
            await prisma.itemListItem.deleteMany({
                where: { postId: data.id },
            });

            if (data.itemListItems.length > 0) {
                await prisma.itemListItem.createMany({
                    data: data.itemListItems.map(
                        (item: { name: string; url: string }, index: number) => ({
                            postId: data.id,
                            name: item.name,
                            url: item.url,
                            order: index,
                        })
                    ),
                });
            }
        }

        const updatedContent = data.content ?? post.content;
        const readTime = calculateReadTime(updatedContent);
        const wordCount = calculateWordCount(updatedContent);

        const updatedPost = await prisma.post.update({
            where: { id: data.id },
            data: {
                title: data.title ?? post.title,
                slug: data.slug ?? post.slug,
                content: data.content ?? post.content,
                description: data.description ?? post.description,
                excerpt: data.excerpt !== undefined ? data.excerpt : post.excerpt,
                image: data.image ?? post.image,
                heroImage: data.heroImage !== undefined ? data.heroImage : post.heroImage,
                status: data.status ?? post.status,
                categoryId: data.categoryId ?? post.categoryId,
                type: data.type,
                metaTitle: data.metaTitle !== undefined ? data.metaTitle : post.metaTitle,
                metaDescription:
                    data.metaDescription !== undefined
                        ? data.metaDescription
                        : post.metaDescription,
                focusKeyword:
                    data.focusKeyword !== undefined ? data.focusKeyword : post.focusKeyword,
                featured: data.featured !== undefined ? data.featured : post.featured,
                pillarPage: data.pillarPage !== undefined ? data.pillarPage : post.pillarPage,
                trending: data.trending !== undefined ? data.trending : post.trending,
                publishedAt:
                    data.publishedAt !== undefined
                        ? typeof data.publishedAt === "string"
                            ? new Date(data.publishedAt)
                            : data.publishedAt
                        : post.publishedAt,
                readTime: readTime,
                wordCount: wordCount,
            },
            include: {
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });

        return updatedPost;
    }

    async function deletePost(id: string) {
        const post = await getPostById(id);
        if (!post) {
            throw new Error("Post not found");
        }

        await prisma.postTag.deleteMany({
            where: { postId: id },
        });

        await prisma.comment.deleteMany({
            where: { postId: id },
        });

        await prisma.fAQ.deleteMany({
            where: { postId: id },
        });

        await prisma.itemListItem.deleteMany({
            where: { postId: id },
        });

        await prisma.post.delete({ where: { id } });
    }

    return {
        buildPostFilter,
        getPosts,
        postSlugExists,
        createPost,
        getPostById,
        updatePost,
        deletePost,
    };
}

export type PostService = ReturnType<typeof createPostService>;
