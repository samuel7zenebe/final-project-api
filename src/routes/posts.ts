import { Router } from "express";
import { uploadSingle } from "../middleware/upload.js";
import { cloudinaryUploadStream } from "../controllers/upload-controller.js";

export const postsRouter = Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new blog post with featured image
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
postsRouter.post("/", uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Image is required" });
      return;
    }

    const result = await cloudinaryUploadStream(req.file.buffer, "blog_covers");

    const postData = {
      // TODO: Map other fields from req.body
      // title: req.body.title,
      // content: req.body.content,
      // category: req.body.category,
      featuredImageUrl: result.secure_url,
      featuredImagePublicId: result.public_id,
      // authorId: req.user?.id,
    };

    console.log("Post data:", postData);

    res.status(201).json({
      message: "Post created successfully",
      // post: postData,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({ message: (error as Error).message });
  }
});
