const express = require('express');
const router = express.Router();
const cors = require('cors');
import { uploadFile, downloadFile, deleteFile } from '../controllers/s3Controller.js';

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

// Example S3 routes
router.get('/upload', uploadFile);

router.post('/upload', (req, res) => {
    res.json({ message: 'File uploaded successfully' });
});

router.get('/download/:fileId', (req, res) => {
    res.json({ message: 'Download file', fileId: req.params.fileId });
});

router.delete('/delete/:fileId', (req, res) => {
    res.json({ message: 'File deleted', fileId: req.params.fileId });
});

module.exports = router;