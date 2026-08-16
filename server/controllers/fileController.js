import drive from "../config/googleDrive.js";
import { Readable } from "stream";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const fileMetadata = {
            name: req.file.originalname,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
        };

        const media = {
            mimeType: req.file.mimetype,
            body: Readable.from(req.file.buffer)
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id, name, mimeType, webViewLink"
        });

        res.status(200).json({
            message: "File uploaded successfully",
            file: response.data
        });

    } catch (error) {
        console.error("Google Drive upload error:", error);

        res.status(500).json({
            message: "File upload failed",
            error: error.message
        });
    }
};