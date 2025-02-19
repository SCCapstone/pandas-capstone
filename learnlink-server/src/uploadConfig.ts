import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";

const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development';
dotenv.config({ path: envFile });

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});// ✅ Store in memory first to allow processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
}).single("profilePic");

// ✅ Middleware: Resize Image and Upload to S3
const resizeAndUpload = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Resize image
    const resizedBuffer = await sharp(req.file.buffer)
      .resize(200, 200, { fit: "cover" }) // Crop to 200x200
      .jpeg({ quality: 90 }) // Convert to JPEG
      .toBuffer();

    // Generate unique file name
    const fileName = `profile-pictures/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        Body: resizedBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      })
    );

    // Generate image URL
    req.body.profilePicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    next();
  } catch (error) {
    console.error("Image processing error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
};

export { upload, resizeAndUpload };