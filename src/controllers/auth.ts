import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "secret";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       201:
 *         description: User registered
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role } = req.body;
    
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({
      email,
      username,
      passwordHash,
      role: role === "ADMIN" ? "ADMIN" : "USER"
    }).returning();
    const user = result[0];
    if (!user) return res.status(500).json({ message: "User creation failed" });

    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await db.select().from(users).where(eq(users.email, email));
    if (!result.length) return res.status(401).json({ message: "Invalid credentials" });

    const user = result[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};
