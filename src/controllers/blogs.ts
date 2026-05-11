import { db } from "../config/db/index.js";
import { blogs } from "../config/db/schema.js";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

// Helper to get user info from request (populated by auth middleware)
const getUser = (req: Request) => (req as any).user as { id: number; role: string };

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog (draft by default)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               coverImageUrl:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Blog created successfully
 */
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, coverImageUrl, categoryId } = req.body;
    const user = getUser(req);
    const result = await db
      .insert(blogs)
      .values({
        title,
        slug: title?.toLowerCase().replace(/\s+/g, "-") || `blog-${Date.now()}`,
        excerpt,
        content,
        coverImageUrl,
        authorId: user.id,
        categoryId,
      })
      .returning();
    res.status(201).json({ blog: result[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get list of public blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of published blogs
 */
export const listPublishedBlogs = async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, "published"));
    res.json({ blogs: rows });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a single blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog details
 */
export const getBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  try {
    const blog = await db.select().from(blogs).where(eq(blogs.id, Number(id)));
    if (!blog.length) return res.status(404).json({ message: "Blog not found" });
    const b = blog[0];
    if (!b) return res.status(404).json({ message: "Blog not found" });
    
    // Only author or admin can see non-published blogs
    if (b.status !== "published") {
      if (!user || (user.role !== "ADMIN" && b.authorId !== user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    return res.json({ blog: b });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog updated
 */
export const updateBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getUser(req);
  const updates = { ...req.body };
  try {
    const existing = await db.select().from(blogs).where(eq(blogs.id, Number(id)));
    if (!existing.length) return res.status(404).json({ message: "Blog not found" });
    const blog = existing[0];
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Authors can edit their own; Admins can edit any
    if (user.role !== "ADMIN" && blog.authorId !== user.id) {
      return res.status(403).json({ message: "Forbidden: Not the author or admin" });
    }

    // ONLY ADMIN can publish
    if (updates.status === "published" && user.role !== "ADMIN") {
      delete updates.status; // Prevent unauthorized publishing
    }

    const result = await db.update(blogs).set(updates).where(eq(blogs.id, Number(id))).returning();
    return res.json({ blog: result[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog deleted
 */
export const deleteBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getUser(req);
  try {
    const existing = await db.select().from(blogs).where(eq(blogs.id, Number(id)));
    if (!existing.length) return res.status(404).json({ message: "Blog not found" });
    const blog = existing[0];
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Authors can delete their own; Admins can delete any
    if (user.role !== "ADMIN" && blog.authorId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await db.delete(blogs).where(eq(blogs.id, Number(id)));
    return res.json({ message: "Blog deleted" });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};

