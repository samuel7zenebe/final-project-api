import { db } from "../config/db/index.js";
import { categories } from "../config/db/schema.js";
import type { Request, Response } from "express";


/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(categories);
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category (Admin only)
 *     tags: [Categories]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const result = await db.insert(categories).values({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description
    }).returning();
    res.status(201).json({ category: result[0] });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
