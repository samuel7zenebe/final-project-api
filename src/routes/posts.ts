import express from "express";

import { uploadSingle } from "../middleware/upload.js";
import { uploadToCloudinary } from "../controllers/upload-controller.js";

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new blog post with featured image
 *     tags: [Posts]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 */
export const postsRouter = express.Router();

postsRouter.post(
  "/",
  uploadSingle, // Multer middleware
  uploadToCloudinary, // Cloudinary upload
  async (req, res) => {
    try {
      const imageUrl = (req as any).cloudinaryResult?.secure_url;
      const imagePublicId = (req as any).cloudinaryResult?.public_id;

      const postData = {
        // title: req.body.title,
        // content: req.body.content,
        // category: req.body.category,
        featuredImage: imageUrl,
        imagePublicId: imagePublicId,
        // author: req.user.id, // from auth middleware
      };

      // Save to database...
      // const post = await Post.create(postData);
      console.log(postData);

      res.status(201).json({
        message: "Post created successfully",
        // post,
        imageUrl,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
);
