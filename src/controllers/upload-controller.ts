import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary_config.js";
import type {
  UploadApiErrorResponse,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";
import stream from "stream";
import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";

export const cloudinaryUploadStream = (
  fileBuffer: Buffer,
  folder: string,
  publicId?: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const options: UploadApiOptions = {
      folder,
      resource_type: "image",
      transformation: [{ width: 1200, height: 630, crop: "limit" }],
    };
    if (publicId) {
      options.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) return reject(error);
        if (result) return resolve(result);
        reject(new Error("Upload failed: No result"));
      },
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Upload profile image
 * POST /api/upload/profile
 */
export const uploadProfileImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    const result = await cloudinaryUploadStream(
      req.file.buffer,
      "profile_images",
    );

    if (result.secure_url) {
      await db.update(users).set({
        avatarUrl: result.secure_url,
      });
    }

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      message: "Profile image uploaded successfully",
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({ message: "Profile image upload failed" });
  }
};

/**
 * Upload blog cover image
 * POST /api/upload/blog-cover
 */
export const uploadBlogCover = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    const result = await cloudinaryUploadStream(req.file.buffer, "blog_covers");

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      message: "Blog cover image uploaded successfully",
    });
  } catch (error) {
    console.error("Blog cover image upload error:", error);
    res.status(500).json({ message: "Blog cover image upload failed" });
  }
};

/**
 * Upload multiple blog images (gallery)
 * POST /api/upload/blog-gallery
 */
export const uploadBlogGallery = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ message: "No image files provided" });
      return;
    }

    const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
      cloudinaryUploadStream(file.buffer, "blog_gallery"),
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
    }));

    res.json({
      images,
      message: "Gallery images uploaded successfully",
    });
  } catch (error) {
    console.error("Gallery upload error:", error);
    res.status(500).json({ message: "Gallery upload failed" });
  }
};
