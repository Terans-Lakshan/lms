const express = require('express');
const router = express.Router();
const { upload, s3 } = require('../config/s3');
const { authenticateToken } = require('../middlewares/auth');

console.log('Upload routes module loaded');

// Test S3 connection
router.get('/test-s3', authenticateToken, async (req, res) => {
    try {
        const bucketName = (process.env.AWS_BUCKET || 'geo-lms').trim();
        const params = { Bucket: bucketName };
        
        await s3.headBucket(params).promise();
        
        res.json({ 
            message: 'S3 connection successful',
            bucket: bucketName,
            region: process.env.AWS_REGION
        });
    } catch (error) {
        console.error('S3 connection test failed:', error);
        res.status(500).json({ 
            message: 'S3 connection failed',
            error: error.message,
            code: error.code
        });
    }
});

// Upload image to S3
router.post('/upload', (req, res, next) => {
    console.log('=== Upload endpoint hit ===');
    console.log('Headers:', req.headers);
    authenticateToken(req, res, (err) => {
        if (err) {
            console.error('Authentication error:', err);
            return res.status(401).json({ message: 'Authentication failed', error: err.message });
        }
        console.log('Authentication successful, user:', req.user);
        next();
    });
}, (req, res) => {
    console.log('Upload request received after auth');
    console.log('User:', req.user);
    
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.error('=== Multer/S3 upload error ===');
            console.error('Error code:', err.code);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            
            return res.status(500).json({ 
                message: 'Failed to upload file', 
                error: err.message,
                code: err.code,
                details: err.toString()
            });
        }

        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File uploaded successfully:', {
            key: req.file.key,
            location: req.file.location,
            bucket: req.file.bucket,
            size: req.file.size
        });

        // Return the S3 URL
        res.json({
            message: 'File uploaded successfully',
            url: req.file.location,
            key: req.file.key
        });
    });
});

// Delete image from S3
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        const { key } = req.body;
        
        if (!key) {
            return res.status(400).json({ message: 'File key is required' });
        }

        const s3 = require('../config/s3').s3;
        
        const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET || 'geo-lms').trim();
        
        const params = {
            Bucket: bucketName,
            Key: key
        };

        await s3.deleteObject(params).promise();

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
});

module.exports = router;
