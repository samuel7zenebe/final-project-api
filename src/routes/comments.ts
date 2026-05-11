import { Router } from "express";
import { getComments, addComment, approveComment } from "../controllers/comments.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

export const commentsRouter = Router();

commentsRouter.get("/:blogId", getComments);
commentsRouter.post("/", authMiddleware, addComment);
commentsRouter.patch("/:id/approve", authMiddleware, adminOnly, approveComment);
