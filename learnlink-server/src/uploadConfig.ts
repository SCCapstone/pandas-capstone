import multer from "multer";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import heicConvert from "heic-convert";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

// Load environment config
const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development';
dotenv.config({ path: envFile });

const requiredEnv = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "S3_BUCKET_NAME"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const prisma = new PrismaClient();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && file.mimetype !== "image/heic" && file.mimetype !== "image/heif") {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
}).single("profilePic");

const processImageBuffer = async (file: Express.Multer.File): Promise<{ buffer: Buffer, contentType: string }> => {
  let imageBuffer = file.buffer;
  let contentType = file.mimetype;

  if (contentType === "image/heic" || contentType === "image/heif") {
    const convertedBuffer = await heicConvert({
      buffer: file.buffer,
      format: "JPEG",
      quality: 0.9,
    });
    imageBuffer = Buffer.from(convertedBuffer);
    contentType = "image/jpeg";
  }

  const outputBuffer = await sharp(imageBuffer)
    .resize(400, 400, { fit: "cover" })
    .composite([
      {
        input: Buffer.from(`<svg><circle cx="200" cy="200" r="200" fill="white"/></svg>`),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  return { buffer: outputBuffer, contentType: "image/png" };
};

const uploadToS3 = async (
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> => {
  const fileName = `profile-pictures/${Date.now()}_${originalName.replace(/\s+/g, "_")}`;

  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
      // ACL: "public-read", // Only include this if your bucket policy supports it
    },
  });

  parallelUploads3.on("httpUploadProgress", (progress) => {
    console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
  });

  await parallelUploads3.done();

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const deleteOldImage = async (imageUrl: string) => {
  if (!imageUrl) return;
  const oldImageKey = imageUrl.split("/").slice(-2).join("/");

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: oldImageKey,
    }));
  } catch (err) {
    console.error("Failed to delete old image:", err);
  }
};

const resizeAndUpload = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const userId = res.locals.userId;

  try {
    const { buffer, contentType } = await processImageBuffer(req.file);
    const newProfilePicUrl = await uploadToS3(buffer, req.file.originalname, contentType);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePic: true },
    });

    if (user?.profilePic) await deleteOldImage(user.profilePic);

    await prisma.user.update({
      where: { id: userId },
      data: { profilePic: newProfilePicUrl },
    });

    return res.json({ profilePicUrl: newProfilePicUrl });
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ error: "Image upload failed" });
  }
};

const handleImagePreview = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const { buffer } = await processImageBuffer(req.file);
    const base64Image = buffer.toString("base64");

    return res.json({
      preview: `data:image/png;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ error: "Image processing failed" });
  }
};

const resizeAndUploadStudyGroup = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const chatID = parseInt(req.body.chatID!);

  try {
    const { buffer, contentType } = await processImageBuffer(req.file);
    const newProfilePicUrl = await uploadToS3(buffer, req.file.originalname, contentType);

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { chatID },
      select: { profilePic: true },
    });

    if (studyGroup?.profilePic) await deleteOldImage(studyGroup.profilePic);

    await prisma.studyGroup.update({
      where: { chatID },
      data: { profilePic: newProfilePicUrl },
    });

    return res.json({ profilePicUrl: newProfilePicUrl });
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ error: "Image upload failed" });
  }
};

// Optional: debug route to bypass processing and test upload directly
const debugDirectUpload = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const url = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    return res.json({ success: true, url });
  } catch (err) {
    console.error("Direct upload failed:", err);
    res.status(500).json({ error: "Direct upload failed", details: err });
  }
};

export {
  upload,
  resizeAndUpload,
  handleImagePreview,
  resizeAndUploadStudyGroup,
  debugDirectUpload
};
