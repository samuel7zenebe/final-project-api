import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../config/db/index.js";
import { users, blogs } from "../config/db/schema.js";
import { eq, desc, sql } from "drizzle-orm";

interface UserWithoutPassword extends Omit<typeof users.$inferSelect, "passwordHash"> {}

/**
 * GET /api/users
 * Admin only - list all users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Count total
    const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(users);
    const total = Number(totalResult?.total) || 0;

    // Get users
    const results = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limitNum)
      .offset(offset);

    const safeResults: UserWithoutPassword[] = results.map((u: any) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });

    res.json({
      users: safeResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * GET /api/users/:id
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (!userId || userId <= 0) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const result = await db.select().from(users).where(eq(users.id, userId));

    if (!result.length || !result[0]) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = result[0] as typeof users.$inferSelect;
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/**
 * PUT /api/users/:id
 * Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    const currentUser = (req as any).user;
    const { username, email } = req.body;

    if (!userId || userId <= 0) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const existing = await db.select().from(users).where(eq(users.id, userId));
    if (!existing.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingUser = existing[0] as typeof users.$inferSelect;

    if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (email && email !== existingUser.email) {
      const emailExists = await db.select().from(users).where(eq(users.email, email));
      if (emailExists.length) {
        res.status(400).json({ message: "Email already in use" });
        return;
      }
    }

    if (username && username !== existingUser.username) {
      const usernameExists = await db.select().from(users).where(eq(users.username, username));
      if (usernameExists.length) {
        res.status(400).json({ message: "Username already taken" });
        return;
      }
    }

    const updates: Record<string, any> = { username, email };

    const updatedResults = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedResults.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updated = updatedResults[0] as typeof users.$inferSelect;
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    const currentUser = (req as any).user;

    if (!userId || userId <= 0) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    if (currentUser.id === userId) {
      res.status(400).json({ message: "Cannot delete your own account" });
      return;
    }

    const existing = await db.select().from(users).where(eq(users.id, userId));
    if (!existing.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await db.delete(users).where(eq(users.id, userId));

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

/**
 * GET /api/users/me
 * Get current user's profile
 */
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const result = await db.select().from(users).where(eq(users.id, userId));

    if (!result.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = result[0] as typeof users.$inferSelect;
    const { passwordHash, ...safeUser } = user;

    // Get user's blog count
    const blogCountResult = await db.select({ total: sql<number>`count(*)` }).from(blogs).where(eq(blogs.authorId, userId)) as any;
    const blogCount = blogCountResult[0]?.total || 0;

    res.json({
      user: safeUser,
      stats: {
        blogs: Number(blogCount),
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * PUT /api/users/me
 * Update current user's profile
 */
export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { username, email } = req.body;

    const existing = await db.select().from(users).where(eq(users.id, userId));

    if (!existing.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingUser = existing[0] as typeof users.$inferSelect;

    if (email && email !== existingUser.email) {
      const emailExists = await db.select().from(users).where(eq(users.email, email));
      if (emailExists.length) {
        res.status(400).json({ message: "Email already in use" });
        return;
      }
    }

    if (username && username !== existingUser.username) {
      const usernameExists = await db.select().from(users).where(eq(users.username, username));
      if (usernameExists.length) {
        res.status(400).json({ message: "Username already taken" });
        return;
      }
    }

    const updatedResults = await db
      .update(users)
      .set({ username, email })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedResults.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updated = updatedResults[0] as typeof users.$inferSelect;
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/**
 * PATCH /api/users/me/password
 * Change current user's password
 */
export const changeMyPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = (req.body as any);

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Current password and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: "New password must be at least 8 characters" });
      return;
    }

    const userResults = await db.select().from(users).where(eq(users.id, userId));
    const user = userResults[0] as typeof users.$inferSelect | undefined;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId));

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};
