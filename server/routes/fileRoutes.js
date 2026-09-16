import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/fileController.js";
import { getMaxUploadSize, formatFileSize } from "../config/s3.js";

const router = express.Router();

const MAX_FILE_SIZE = getMaxUploadSize('course-material');

// Files are buffered in memory before being streamed to Drive, so the size cap is
// what keeps a single upload from exhausting the server's memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

// Report an oversized file as 413 rather than letting multer's error reach the
// default error handler as a 500
const handleUpload = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    message: `File is too large. Maximum allowed size is ${formatFileSize(MAX_FILE_SIZE)}.`,
                    error: err.message,
                    code: err.code,
                    maxFileSize: MAX_FILE_SIZE
                });
            }

            return res.status(400).json({ message: "File upload failed", error: err.message });
        }

        next();
    });
};

router.post(
    "/upload",
    handleUpload,
    uploadFile
);

export default router;
