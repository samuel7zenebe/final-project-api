import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  _file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  if (_file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Single image upload middleware
export const uploadSingle = upload.single("image"); // 'image' is the field name from frontend