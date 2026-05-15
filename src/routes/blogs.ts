import { Router } from "express";
import {
  createBlog,
  listAllBlogs,
  getBlogCategories,
  getBlogTags,
  getBlog,
  updateBlog,
  deleteBlog,
  listPublishedBlogs,
} from "../controllers/blogs.js";
import { adminOnly, authMiddleware } from "../middleware/auth.js";

export const blogsRouter = Router();

// Admin only route (currently disabled)
blogsRouter.get("/all", authMiddleware, adminOnly, listAllBlogs);

// Public routes
blogsRouter.get("/", listPublishedBlogs);
blogsRouter.get("/:blogId/categories", getBlogCategories);
blogsRouter.get("/:blogId/tags", getBlogTags);
blogsRouter.get("/:id", getBlog);

// Protected routes
blogsRouter.post("/", authMiddleware, createBlog);
blogsRouter.put("/:id", authMiddleware, updateBlog);
blogsRouter.delete("/:id", authMiddleware, deleteBlog);

// admin-only route
