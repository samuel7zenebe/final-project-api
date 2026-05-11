import { Router } from "express";
import { getCategories, createCategory } from "../controllers/categories.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", getCategories);
categoriesRouter.post("/", authMiddleware, adminOnly, createCategory);
