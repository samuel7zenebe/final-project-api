import { Router } from "express";
import {
  uploadProfileImage,
  uploadBlogCover,
  uploadBlogGallery,
} from "../controllers/upload-controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadSingle, uploadMultiple } from "../middleware/upload.js";

export const uploadRouter = Router();

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload profile image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded
 */
uploadRouter.post("/profile", authMiddleware, uploadSingle, uploadProfileImage);

/**
 * @swagger
 * /api/upload/blog-cover:
 *   post:
 *     summary: Upload blog cover image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog cover image uploaded
 */
uploadRouter.post("/blog-cover", authMiddleware, uploadSingle, uploadBlogCover);

/**
 * @swagger
 * /api/upload/blog-gallery:
 *   post:
 *     summary: Upload multiple blog gallery images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Gallery images uploaded
 */
uploadRouter.post("/blog-gallery", authMiddleware, uploadMultiple, uploadBlogGallery);
