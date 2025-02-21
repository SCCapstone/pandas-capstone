import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";


const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development';
dotenv.config({ path: envFile });

const prisma = new PrismaClient();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});// ✅ Store in memory first to allow processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 2MB file limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && file.mimetype !== "image/heic" && file.mimetype !== "image/heif") {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
}).single("profilePic");

// ✅ Middleware: Resize Image and Upload to S3
const resizeAndUpload = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const userId = res.locals.userId; // Get the current user ID


  try {
    let imageBuffer = req.file.buffer;
    let format = "png"; // Default format

    // 🔄 Convert HEIC to PNG if needed
    if (req.file.mimetype === "image/heic" || req.file.mimetype === "image/heif") {
      imageBuffer = await sharp(imageBuffer).toFormat("png").toBuffer();
      format = "png";
    }

    // 📏 Resize image and apply circular crop
    const resizedBuffer = await sharp(imageBuffer)
      .resize(400, 400, { fit: "cover" }) // Crop to 400x400
      .composite([
        {
          input: Buffer.from(
            `<svg><circle cx="200" cy="200" r="200" fill="white"/></svg>`
          ),
          blend: "dest-in",
        },
      ]) // Apply a circular mask
      .png()
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
    const newProfilePicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    // Fetch the current profile picture URL (if it exists)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePic: true },
    });

    if (user?.profilePic) {
      // Extract the S3 key from the old image URL
      const oldImageKey = user.profilePic.split("/").slice(-2).join("/");

      // Delete the old image from S3
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: oldImageKey,
          })
        );
      } catch (deleteError) {
        console.error("Failed to delete old image:", deleteError);
      }
    }

    // Update the user's profile picture URL in the database
    await prisma.user.update({
      where: { id: userId },
      data: { profilePic: newProfilePicUrl },
    });

    // Set the new profile picture URL in the request body to pass to the next middleware
    req.body.profilePicUrl = newProfilePicUrl;

    
    next();
  } catch (error) {
    console.error("Image processing error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
};

export { upload, resizeAndUpload };