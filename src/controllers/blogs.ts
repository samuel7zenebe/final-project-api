import { db } from "../config/db/index.js";
import { blogs, categories, tags, blogTags } from "../config/db/schema.js";
import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";

// Helper to get user info from request (populated by auth middleware)
const getUser = (req: Request) =>
  (req as any).user as { id: number; role: string };

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
 *     summary: Get all every list of blogs
 *     tags: [Blogs , total ]
 *     responses:
 *       200:
 *         description: List of published blogs
 */
export const listAllBlogs = async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(blogs);
    res.json({ total: rows.length, blogs: rows });
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
 * /api/blogs/{blogId}/categories:
 *   get:
 *     summary: Get the category for a specific blog
 *     tags: [Blogs, Categories]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Category details for the blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     blogCount:
 *                       type: integer
 *                       description: Total published blogs in this category
 *       404:
 *         description: Blog not found or no category assigned
 */
export const getBlogCategories = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const blogIdNum = Number(blogId);

    if (!blogIdNum || blogIdNum <= 0) {
      res.status(400).json({ message: "Invalid blog ID" });
      return;
    }

    // Fetch the blog with its category
    const blogResults = await db
      .select({
        blog: blogs,
        category: categories,
      })
      .from(blogs)
      .leftJoin(categories, eq(blogs.categoryId, categories.id))
      .where(eq(blogs.id, blogIdNum));

    if (!blogResults.length) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    const result = blogResults[0];
    if (!result || !result.category) {
      res.status(404).json({ message: "Blog has no assigned category" });
      return;
    }

    const category = result.category;

    // Get count of published blogs in this category
    const [countResult] = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(blogs)
      .where(eq(blogs.categoryId, category.id));

    const blogCount = (countResult && countResult.cnt) ? Number(countResult.cnt) : 0;

    const categoryWithCount = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      blogCount,
    };

    res.json({ category: categoryWithCount });
  } catch (err) {
    console.error("Get blog category error:", err);
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/blogs/{blogId}/tags:
 *   get:
 *     summary: Get the tags for a specific blog
 *     tags: [Blogs, Tags]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: List of tags for the blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *       404:
 *         description: Blog not found
 */
export const getBlogTags = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const blogIdNum = Number(blogId);

    if (!blogIdNum || blogIdNum <= 0) {
      res.status(400).json({ message: "Invalid blog ID" });
      return;
    }

    // Verify blog exists
    const blogExists = await db.select().from(blogs).where(eq(blogs.id, blogIdNum));
    if (!blogExists.length) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    // Get tags for this blog via blog_tags junction
    const results = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(blogTags)
      .innerJoin(tags, eq(blogTags.tagId, tags.id))
      .where(eq(blogTags.blogId, blogIdNum));

    res.json({ tags: results });
  } catch (err) {
    console.error("Get blog tags error:", err);
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
    const blog = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, Number(id)));
    if (!blog.length)
      return res.status(404).json({ message: "Blog not found" });
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
    const existing = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, Number(id)));
    if (!existing.length)
      return res.status(404).json({ message: "Blog not found" });
    const blog = existing[0];
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Authors can edit their own; Admins can edit any
    if (user.role !== "ADMIN" && blog.authorId !== user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not the author or admin" });
    }

    // ONLY ADMIN can publish
    if (updates.status === "published" && user.role !== "ADMIN") {
      delete updates.status; // Prevent unauthorized publishing
    }

    const result = await db
      .update(blogs)
      .set(updates)
      .where(eq(blogs.id, Number(id)))
      .returning();
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
    const existing = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, Number(id)));
    if (!existing.length)
      return res.status(404).json({ message: "Blog not found" });
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
