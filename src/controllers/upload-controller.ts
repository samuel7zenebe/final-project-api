import type { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary_config.js";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import stream from "stream";

export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      return next(); // No file uploaded → continue (for optional images)
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: process.env["CLOUDINARY_FOLDER"] || "blog_images",
        resource_type: "image",
        transformation: [{ width: 1200, height: 630, crop: "limit" }],
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) return next(error);

        (req as any).cloudinaryResult = result;
        next();
      },
    );

    // Convert buffer to stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(result);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};
