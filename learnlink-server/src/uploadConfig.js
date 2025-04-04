"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeAndUploadStudyGroup = exports.handleImagePreview = exports.resizeAndUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
const client_1 = require("@prisma/client");
const client_s3_2 = require("@aws-sdk/client-s3");
const heic_convert_1 = __importDefault(require("heic-convert"));
const stream_1 = __importDefault(require("stream"));
const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development';
dotenv_1.default.config({ path: envFile });
const prisma = new client_1.PrismaClient();
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});
// Ensure all necessary environment variables are present
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
    throw new Error("Missing AWS configuration in environment variables");
}
// Store in memory first to allow processing
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/") && file.mimetype !== "image/heic" && file.mimetype !== "image/heif") {
            return cb(new Error("Only image uploads are allowed"));
        }
        cb(null, true);
    },
}).single("profilePic");
exports.upload = upload;
// Helper function to handle HEIC conversion
const convertHeicToJpeg = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const convertedBuffer = yield (0, heic_convert_1.default)({
            buffer: buffer,
            format: "JPEG",
            quality: 0.9,
        });
        return Buffer.from(convertedBuffer);
    }
    catch (error) {
        console.error("Error converting HEIC:", error);
        throw new Error("HEIC conversion failed");
    }
});
// Middleware: Resize Image and Upload to S3 (optimized for memory)
const resizeAndUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const userId = res.locals.userId; // Get the current user ID
    let imageBuffer = req.file.buffer;
    let contentType = req.file.mimetype;
    try {
        // Convert HEIC to JPEG if necessary
        if (contentType === "image/heic" || contentType === "image/heif") {
            imageBuffer = yield convertHeicToJpeg(req.file.buffer);
            contentType = "image/jpeg";
        }
        // Use a sharp stream to avoid loading the entire image into memory
        const sharpStream = (0, sharp_1.default)(imageBuffer)
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
        const passThroughStream = new stream_1.default.PassThrough();
        sharpStream.pipe(passThroughStream);
        // Upload to S3 directly from the stream
        yield s3.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: passThroughStream,
            ContentType: "image/jpeg",
            ACL: "public-read",
        }));
        // Generate image URL
        const newProfilePicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        // Fetch current profile picture URL (if it exists)
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { profilePic: true },
        });
        if (user === null || user === void 0 ? void 0 : user.profilePic) {
            // Extract the S3 key from the old image URL
            const oldImageKey = user.profilePic.split("/").slice(-2).join("/");
            // Delete the old image from S3
            try {
                yield s3.send(new client_s3_2.DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: oldImageKey,
                }));
            }
            catch (deleteError) {
                console.error("Failed to delete old image:", deleteError);
            }
        }
        // Update the user's profile picture URL in the database
        yield prisma.user.update({
            where: { id: userId },
            data: { profilePic: newProfilePicUrl },
        });
        // Pass the new profile picture URL to the next middleware
        req.body.profilePicUrl = newProfilePicUrl;
        next();
    }
    catch (error) {
        console.error("Image processing error:", error);
        return res.status(500).json({ error: "Image upload failed" });
    }
});
exports.resizeAndUpload = resizeAndUpload;
// Middleware: Handle Image Preview (optimized for memory)
const handleImagePreview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    let contentType = req.file.mimetype;
    let imageBuffer = req.file.buffer;
    try {
        if (contentType === "image/heic" || contentType === "image/heif") {
            imageBuffer = yield convertHeicToJpeg(req.file.buffer);
            contentType = "image/jpeg";
        }
        // Resize image to 400x400 for preview
        const resizedBuffer = yield (0, sharp_1.default)(imageBuffer)
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
    }
    catch (error) {
        console.error("Image processing error:", error);
        return res.status(500).json({ error: "Image processing failed" });
    }
});
exports.handleImagePreview = handleImagePreview;
// Middleware: Resize Image and Upload to Study Group Profile Pic (optimized for memory)
const resizeAndUploadStudyGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const chatID = parseInt(req.body.chatID); // Get the current chat ID
    let imageBuffer = req.file.buffer;
    let contentType = req.file.mimetype;
    try {
        // Convert HEIC to JPEG if necessary
        if (contentType === "image/heic" || contentType === "image/heif") {
            imageBuffer = yield convertHeicToJpeg(req.file.buffer);
            contentType = "image/jpeg";
        }
        // Use a sharp stream to avoid loading the entire image into memory
        const sharpStream = (0, sharp_1.default)(imageBuffer)
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
        const passThroughStream = new stream_1.default.PassThrough();
        sharpStream.pipe(passThroughStream);
        // Upload to S3 directly from the stream
        yield s3.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: passThroughStream,
            ContentType: "image/jpeg",
            ACL: "public-read",
        }));
        // Generate image URL
        const newProfilePicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        // Fetch current profile picture URL (if it exists)
        const studyGroup = yield prisma.studyGroup.findUnique({
            where: { chatID: chatID },
            select: { profilePic: true },
        });
        if (studyGroup === null || studyGroup === void 0 ? void 0 : studyGroup.profilePic) {
            // Extract the S3 key from the old image URL
            const oldImageKey = studyGroup.profilePic.split("/").slice(-2).join("/");
            // Delete the old image from S3
            try {
                yield s3.send(new client_s3_2.DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: oldImageKey,
                }));
            }
            catch (deleteError) {
                console.error("Failed to delete old image:", deleteError);
            }
        }
        // Update the study group's profile picture URL in the database
        yield prisma.studyGroup.update({
            where: { chatID: chatID },
            data: { profilePic: newProfilePicUrl },
        });
        // Pass the new profile picture URL to the next middleware
        req.body.profilePicUrl = newProfilePicUrl;
        next();
    }
    catch (error) {
        console.error("Image processing error:", error);
        return res.status(500).json({ error: "Image upload failed" });
    }
});
exports.resizeAndUploadStudyGroup = resizeAndUploadStudyGroup;
