import { Router } from "express";
import { createBlog, listPublishedBlogs, getBlog, updateBlog, deleteBlog } from "../controllers/blogs.js";
import { authMiddleware } from "../middleware/auth.js";

export const blogsRouter = Router();

// Public routes
blogsRouter.get("/", listPublishedBlogs);
blogsRouter.get("/:id", getBlog);

// Protected routes
blogsRouter.post("/", authMiddleware, createBlog);
blogsRouter.put("/:id", authMiddleware, updateBlog);
blogsRouter.delete("/:id", authMiddleware, deleteBlog);
