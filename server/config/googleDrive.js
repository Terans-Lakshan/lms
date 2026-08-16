import dotenv from "dotenv";
// Load environment variables
dotenv.config();

import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(
    "Google service account file:",
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE
);

const keyPath = path.join(
    __dirname,
    "..",
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE
);

const credentials = JSON.parse(
    fs.readFileSync(keyPath, "utf8")
);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
        "https://www.googleapis.com/auth/drive"
    ]
});

const drive = google.drive({
    version: "v3",
    auth
});

export default drive;