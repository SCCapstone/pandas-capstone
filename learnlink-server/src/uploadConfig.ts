import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import heicConvert from "heic-convert";
import stream from "stream";

const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development';
dotenv.config({ path: envFile });

const prisma = new PrismaClient();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

// Ensure all necessary environment variables are present
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
  throw new Error("Missing AWS configuration in environment variables");
}

// Store in memory first to allow processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && file.mimetype !== "image/heic" && file.mimetype !== "image/heif") {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
}).single("profilePic");

// Helper function to handle HEIC conversion
const convertHeicToJpeg = async (buffer: Buffer) => {
  try {
    const convertedBuffer = await heicConvert({
      buffer: buffer,
      format: "JPEG",
      quality: 0.9,
    });
    return Buffer.from(convertedBuffer);
  } catch (error) {
    console.error("Error converting HEIC:", error);
    throw new Error("HEIC conversion failed");
  }
};

// Middleware: Resize Image and Upload to S3 (optimized for memory)
const resizeAndUpload = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const userId = res.locals.userId; // Get the current user ID
  let imageBuffer = req.file.buffer;
  let contentType = req.file.mimetype;

  try {
    // Convert HEIC to JPEG if necessary
    if (contentType === "image/heic" || contentType === "image/heif") {
      imageBuffer = await convertHeicToJpeg(req.file.buffer);
      contentType = "image/jpeg";
    }

    // Use a sharp stream to avoid loading the entire image into memory
    const sharpStream = sharp(imageBuffer)
      .resize(400, 400, { fit: "cover" }) // Resize and crop to 400x400
      .composite([
        {
          input: Buffer.from(`<svg><circle cx="200" cy="200" r="200" fill="white"/></svg>`),
          blend: "dest-in",
        },
      ])
      .png();

    // Generate a unique file name
    const fileName = `profile-pictures/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;

    // Create a PassThrough stream to upload resized image directly to S3
    const passThroughStream = new stream.PassThrough();
    sharpStream.pipe(passThroughStream);

    // Upload to S3 directly from the stream
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        Body: passThroughStream,
        ContentType: "image/jpeg",
        ACL: "public-read",
      })
    );

    // Generate image URL
    const newProfilePicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Fetch current profile picture URL (if it exists)
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

    // Pass the new profile picture URL to the next middleware
    req.body.profilePicUrl = newProfilePicUrl;

    next();
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ error: "Image upload failed" });
  }
};

// Middleware: Handle Image Preview (optimized for memory)
const handleImagePreview = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  let contentType = req.file.mimetype;
  let imageBuffer = req.file.buffer;

  try {
    if (contentType === "image/heic" || contentType === "image/heif") {
      imageBuffer = await convertHeicToJpeg(req.file.buffer);
      contentType = "image/jpeg";
    }

    // Resize image to 400x400 for preview
    const resizedBuffer = await sharp(imageBuffer)
      .resize(400, 400, { fit: "cover" })
      .composite([
        {
          input: Buffer.from(`<svg><circle cx="200" cy="200" r="200" fill="white"/></svg>`),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    // Send the resized image as base64 encoded string
    const base64Image = resizedBuffer.toString("base64");
    return res.json({
      preview: `data:image/jpeg;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ error: "Image processing failed" });
  }
};

// Middleware: Resize Image and Upload to Study Group Profile Pic (optimized for memory)
const resizeAndUploadStudyGroup = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const chatID = parseInt(req.body.chatID!); // Get the current chat ID
  let imageBuffer = req.file.buffer;
  let contentType = req.file.mimetype;

  try {
    // Convert HEIC to JPEG if necessary
    if (contentType === "image/heic" || contentType === "image/heif") {
      imageBuffer = await convertHeicToJpeg(req.file.buffer);
      contentType = "image/jpeg";
    }

    // Use a sharp stream to avoid loading the entire image into memory
    const sharpStream = sharp(imageBuffer)
      .resize(400, 400, { fit: "cover" })
      .composite([
        {
          input: Buffer.from(`<svg><circle cx="200" cy="200" r="200" fill="white"/></svg>`),
          blend: "dest-in",
        },
      ])
      .png();

    // Generate unique file name
    const fileName = `profile-pictures/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;

    // Create a PassThrough stream to upload resized image directly to S3
    const passThroughStream = new stream.PassThrough();
    sharpStream.pipe(passThroughStream);

    // Upload to S3 directly from the stream
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        Body: passThroughStream,
        ContentType: "image/jpeg",
        ACL: "public-read",
      })
    );

    // Generate image URL
    const newProfilePicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Fetch current profile picture URL (if it exists)
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { chatID: chatID },
      select: { profilePic: true },
    });

    if (studyGroup?.profilePic) {
      // Extract the S3 key from the old image URL
      const oldImageKey = studyGroup.profilePic.split("/").slice(-2).join("/");

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

    // Update the study group's profile picture URL in the database
    await prisma.studyGroup.update({
      where: { chatID: chatID },
      data: { profilePic: newProfilePicUrl },
    });

    // Pass the new profile picture URL to the next middleware
    req.body.profilePicUrl = newProfilePicUrl;

    next();
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ error: "Image upload failed" });
  }
};

export { upload, resizeAndUpload, handleImagePreview, resizeAndUploadStudyGroup };