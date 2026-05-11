import { db } from "../config/db/index.js";
import { comments } from "../config/db/schema.js";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

/**
 * @swagger
 * /api/comments/{blogId}:
 *   get:
 *     summary: Get comments for a blog
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of approved comments
 */
export const getComments = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const rows = await db.select().from(comments).where(eq(comments.blogId, Number(blogId)));
    res.json({ comments: rows });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blogId:
 *                 type: integer
 *               content:
 *                 type: string
 *               authorName:
 *                 type: string
 *               authorEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const { blogId, content, authorName, authorEmail } = req.body;
    const result = await db.insert(comments).values({
      blogId: Number(blogId),
      content,
      authorName,
      authorEmail,
      isApproved: false // Requires admin approval by default
    }).returning();
    res.status(201).json({ comment: result[0] });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/comments/{id}/approve:
 *   patch:
 *     summary: Approve a comment (Admin only)
 *     tags: [Comments]
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
 *         description: Comment approved
 */
export const approveComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(comments).set({ isApproved: true }).where(eq(comments.id, Number(id)));
    res.json({ message: "Comment approved" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
