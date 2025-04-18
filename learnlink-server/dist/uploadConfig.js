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
exports.debugDirectUpload = exports.resizeAndUploadStudyGroup = exports.handleImagePreview = exports.resizeAndUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
const client_1 = require("@prisma/client");
const heic_convert_1 = __importDefault(require("heic-convert"));
const lib_storage_1 = require("@aws-sdk/lib-storage");
// Load environment config
const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development';
dotenv_1.default.config({ path: envFile });
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
const prisma = new client_1.PrismaClient();
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/") && file.mimetype !== "image/heic" && file.mimetype !== "image/heif") {
            return cb(new Error("Only image uploads are allowed"));
        }
        cb(null, true);
    },
}).single("profilePic");
exports.upload = upload;
const processImageBuffer = (file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageBuffer = file.buffer;
    let contentType = file.mimetype;
    if (contentType === "image/heic" || contentType === "image/heif") {
        const convertedBuffer = yield (0, heic_convert_1.default)({
            buffer: file.buffer,
            format: "JPEG",
            quality: 0.9,
        });
        imageBuffer = Buffer.from(convertedBuffer);
        contentType = "image/jpeg";
    }
    const outputBuffer = yield (0, sharp_1.default)(imageBuffer)
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
});
const uploadToS3 = (buffer, originalName, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = `profile-pictures/${Date.now()}_${originalName.replace(/\s+/g, "_")}`;
    const parallelUploads3 = new lib_storage_1.Upload({
        client: s3,
        params: {
            Bucket: process.env.S3_BUCKET_NAME,
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
    yield parallelUploads3.done();
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
});
const deleteOldImage = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!imageUrl)
        return;
    const oldImageKey = imageUrl.split("/").slice(-2).join("/");
    try {
        yield s3.send(new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: oldImageKey,
        }));
    }
    catch (err) {
        console.error("Failed to delete old image:", err);
    }
});
const resizeAndUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const userId = res.locals.userId;
    try {
        const { buffer, contentType } = yield processImageBuffer(req.file);
        const newProfilePicUrl = yield uploadToS3(buffer, req.file.originalname, contentType);
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { profilePic: true },
        });
        if (user === null || user === void 0 ? void 0 : user.profilePic)
            yield deleteOldImage(user.profilePic);
        yield prisma.user.update({
            where: { id: userId },
            data: { profilePic: newProfilePicUrl },
        });
        return res.json({ profilePicUrl: newProfilePicUrl });
    }
    catch (error) {
        console.error("Image processing error:", error);
        return res.status(500).json({ error: "Image upload failed" });
    }
});
exports.resizeAndUpload = resizeAndUpload;
const handleImagePreview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    try {
        const { buffer } = yield processImageBuffer(req.file);
        const base64Image = buffer.toString("base64");
        return res.json({
            preview: `data:image/png;base64,${base64Image}`,
        });
    }
    catch (error) {
        console.error("Image processing error:", error);
        return res.status(500).json({ error: "Image processing failed" });
    }
});
exports.handleImagePreview = handleImagePreview;
const resizeAndUploadStudyGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const chatID = parseInt(req.body.chatID);
    try {
        const { buffer, contentType } = yield processImageBuffer(req.file);
        const newProfilePicUrl = yield uploadToS3(buffer, req.file.originalname, contentType);
        const studyGroup = yield prisma.studyGroup.findUnique({
            where: { chatID },
            select: { profilePic: true },
        });
        if (studyGroup === null || studyGroup === void 0 ? void 0 : studyGroup.profilePic)
            yield deleteOldImage(studyGroup.profilePic);
        yield prisma.studyGroup.update({
            where: { chatID },
            data: { profilePic: newProfilePicUrl },
        });
        return res.json({ profilePicUrl: newProfilePicUrl });
    }
    catch (error) {
        console.error("Image processing error:", error);
        return res.status(500).json({ error: "Image upload failed" });
    }
});
exports.resizeAndUploadStudyGroup = resizeAndUploadStudyGroup;
// Optional: debug route to bypass processing and test upload directly
const debugDirectUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    try {
        const url = yield uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.json({ success: true, url });
    }
    catch (err) {
        console.error("Direct upload failed:", err);
        res.status(500).json({ error: "Direct upload failed", details: err });
    }
});
exports.debugDirectUpload = debugDirectUpload;
