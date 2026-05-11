import { Router } from "express";
import { getTags, createTag } from "../controllers/tags.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

export const tagsRouter = Router();

tagsRouter.get("/", getTags);
tagsRouter.post("/", authMiddleware, adminOnly, createTag);
