import prisma from "@/prisma/client";
import { createPostService } from "@honeylemon/server/blog";

const postService = createPostService({ prisma });

export const buildPostFilter = postService.buildPostFilter;
export const getPosts = postService.getPosts;
export const postSlugExists = postService.postSlugExists;
export const createPost = postService.createPost;
export const getPostById = postService.getPostById;
export const updatePost = postService.updatePost;
export const deletePost = postService.deletePost;
