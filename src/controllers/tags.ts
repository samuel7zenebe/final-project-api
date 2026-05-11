import { db } from "../config/db/index.js";
import { tags } from "../config/db/schema.js";
import type { Request, Response } from "express";


/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of tags
 */
export const getTags = async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(tags);
    res.json({ tags: rows });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created
 */
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await db.insert(tags).values({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-")
    }).returning();
    res.status(201).json({ tag: result[0] });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
