const express = require('express');
const router = express.Router();
const { upload, s3, createUploadMiddleware, createS3Folder, deleteS3Object, deleteS3Folder } = require('../config/s3');
const { authenticateToken } = require('../middlewares/auth');
const Course = require('../models/course');

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

// Upload degree preview image
router.post('/upload-degree-preview', (req, res, next) => {
    console.log('=== Upload degree preview endpoint hit ===');
    console.log('Body:', req.body);
    authenticateToken(req, res, (err) => {
        if (err) {
            console.error('Authentication error:', err);
            return res.status(401).json({ message: 'Authentication failed', error: err.message });
        }
        console.log('Authentication successful, user:', req.user);
        next();
    });
}, async (req, res) => {
    console.log('Upload degree preview request received after auth');
    console.log('User:', req.user);
    
    const degreeUpload = createUploadMiddleware('degree-preview');
    
    degreeUpload.single('image')(req, res, async function (err) {
        if (err) {
            console.error('=== Multer/S3 upload error ===');
            console.error('Error:', err);
            
            return res.status(500).json({ 
                message: 'Failed to upload file', 
                error: err.message
            });
        }

        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            // Create courses folder inside degree folder
            const degreeCode = req.body.degreeCode || 'default-degree';
            const coursesFolder = `degrees/${degreeCode}/courses`;
            await createS3Folder(coursesFolder);
            
            console.log('Degree preview uploaded successfully:', {
                key: req.file.key,
                location: req.file.location,
                coursesFolder: coursesFolder
            });

            res.json({
                message: 'Degree preview uploaded successfully',
                url: req.file.location,
                key: req.file.key,
                degreeFolder: `degrees/${degreeCode}`,
                coursesFolder: coursesFolder
            });
        } catch (error) {
            console.error('Error creating courses folder:', error);
            res.status(500).json({
                message: 'File uploaded but failed to create courses folder',
                error: error.message,
                url: req.file.location,
                key: req.file.key
            });
        }
    });
});

// Upload course material
router.post('/upload-course-material', (req, res, next) => {
    console.log('=== Upload course material endpoint hit ===');
    authenticateToken(req, res, (err) => {
        if (err) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        next();
    });
}, async (req, res) => {
    const courseUpload = createUploadMiddleware('course-material');
    
    courseUpload.single('file')(req, res, async function (err) {
        if (err) {
            console.error('Course material upload error:', err);
            return res.status(500).json({ 
                message: 'Failed to upload file', 
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            // Get course information from request body
            const { courseCode, degreeCode } = req.body;
            
            // Find the course by code
            let course = null;
            if (courseCode) {
                course = await Course.findOne({ code: courseCode });
            }

            // If course found, save file info to resources
            if (course) {
                const newMaterial = {
                    type: 'file',
                    key: req.file.key,
                    url: req.file.location,
                    filename: req.file.originalname,
                    mimeType: req.file.mimetype,
                    uploadedBy: req.user.id,
                    createdAt: new Date()
                };

                course.resources.push(newMaterial);
                await course.save();

                console.log('Course material saved to database:', newMaterial);
            }

            console.log('Course material uploaded successfully:', {
                key: req.file.key,
                location: req.file.location,
                courseCode: courseCode,
                savedToDb: !!course
            });

            res.json({
                message: 'Course material uploaded successfully',
                url: req.file.location,
                key: req.file.key,
                savedToDatabase: !!course
            });
        } catch (error) {
            console.error('Error saving course material to database:', error);
            // Still return success for S3 upload
            res.json({
                message: 'Course material uploaded to S3 but failed to save to database',
                url: req.file.location,
                key: req.file.key,
                error: error.message
            });
        }
    });
});

// Generic upload (backward compatibility)
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

        await deleteS3Object(key);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
});

// Delete degree folder (with all courses inside)
router.delete('/delete-degree-folder', authenticateToken, async (req, res) => {
    try {
        const { degreeCode } = req.body;
        
        if (!degreeCode) {
            return res.status(400).json({ message: 'Degree code is required' });
        }

        const folderPath = `degrees/${degreeCode}/`;
        await deleteS3Folder(folderPath);
        
        res.json({ 
            message: 'Degree folder and all contents deleted successfully',
            deletedFolder: folderPath
        });
    } catch (error) {
        console.error('Delete folder error:', error);
        res.status(500).json({ message: 'Failed to delete folder', error: error.message });
    }
});

// Delete course folder
router.delete('/delete-course-folder', authenticateToken, async (req, res) => {
    try {
        const { degreeCode, courseCode } = req.body;
        
        if (!degreeCode || !courseCode) {
            return res.status(400).json({ message: 'Degree code and course code are required' });
        }

        const folderPath = `degrees/${degreeCode}/courses/${courseCode}/`;
        await deleteS3Folder(folderPath);
        
        res.json({ 
            message: 'Course folder and all contents deleted successfully',
            deletedFolder: folderPath
        });
    } catch (error) {
        console.error('Delete course folder error:', error);
        res.status(500).json({ message: 'Failed to delete course folder', error: error.message });
    }
});

module.exports = router;
