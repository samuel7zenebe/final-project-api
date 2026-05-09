import cloudinary from "../config/cloudinary_config.js";
import stream from "stream";

export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // No file uploaded → continue (for optional images)
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "blog_images",
        resource_type: "image",
        transformation: [{ width: 1200, height: 630, crop: "limit" }], // Good for blog featured images
      },
      (error, result) => {
        if (error) return next(error);

        req.cloudinaryResult = result;
        next();
      },
    );

    // Convert buffer to stream

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(result);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ message: "Image upload failed" });
  }
};
