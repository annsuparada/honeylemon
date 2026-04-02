import prisma from "@/prisma/client";
import { createUserService } from "@honeylemon/server/blog";

const userService = createUserService({ prisma });

export const getAllUsers = userService.getAllUsers;
export const emailExists = userService.emailExists;
export const usernameExists = userService.usernameExists;
export const getUserByEmail = userService.getUserByEmail;
export const createUser = userService.createUser;
export const updateUser = userService.updateUser;
export const deleteUser = userService.deleteUser;
