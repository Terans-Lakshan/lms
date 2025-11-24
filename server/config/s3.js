const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS - trim any spaces from env variables
const awsConfig = {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || '').trim(),
    region: (process.env.AWS_REGION || 'us-east-1').trim()
};

AWS.config.update(awsConfig);

const s3 = new AWS.S3();

console.log('AWS S3 Configuration:');
console.log('Region:', awsConfig.region);
console.log('Bucket:', (process.env.AWS_BUCKET || process.env.AWS_S3_BUCKET_NAME || '').trim());
console.log('Access Key ID:', awsConfig.accessKeyId ? `${awsConfig.accessKeyId.substring(0, 10)}...` : 'Missing');
console.log('Secret Key:', awsConfig.secretAccessKey ? 'Present' : 'Missing');

// Helper function to generate S3 key based on context
const generateS3Key = (uploadType, identifier, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    
    switch(uploadType) {
        case 'degree-preview':
            // Format: degrees/{degreeCode}/preview-{timestamp}.{ext}
            return `degrees/${identifier}/preview-${uniqueSuffix}.${extension}`;
        case 'course-material':
            // Format: degrees/{degreeCode}/courses/{courseCode}/{timestamp}.{ext}
            return `degrees/${identifier.degreeCode}/courses/${identifier.courseCode}/${uniqueSuffix}.${extension}`;
        default:
            // Fallback to old format
            return `degree-images/${uniqueSuffix}.${extension}`;
    }
};

// Configure multer to use S3 with dynamic key generation
const createUploadMiddleware = (uploadType) => {
    return multer({
        storage: multerS3({
            s3: s3,
            bucket: (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET || 'geo-lms').trim(),
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: function (req, file, cb) {
                cb(null, { 
                    fieldName: file.fieldname,
                    uploadType: uploadType,
                    uploadedBy: req.user?.id || 'unknown'
                });
            },
            key: function (req, file, cb) {
                try {
                    let identifier;
                    
                    if (uploadType === 'degree-preview') {
                        // For degree preview, use degree code from request body
                        identifier = req.body.degreeCode || `degree-${Date.now()}`;
                    } else if (uploadType === 'course-material') {
                        // For course materials, use both degree and course codes
                        identifier = {
                            degreeCode: req.body.degreeCode || 'default-degree',
                            courseCode: req.body.courseCode || 'default-course'
                        };
                    } else {
                        identifier = 'default';
                    }
                    
                    const key = generateS3Key(uploadType, identifier, file);
                    console.log('Generated S3 key:', key);
                    cb(null, key);
                } catch (error) {
                    console.error('Error generating S3 key:', error);
                    cb(error);
                }
            }
        }),
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: function (req, file, cb) {
            // For degree preview images, accept only images
            if (uploadType === 'degree-preview') {
                if (!file.mimetype.startsWith('image/')) {
                    return cb(new Error('Only image files are allowed for degree preview!'), false);
                }
            } else if (uploadType === 'course-material') {
                // For course materials, accept documents, PDFs, images, etc.
                const allowedMimeTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/jpg'
                ];
                
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    return cb(new Error('File type not allowed! Allowed types: PDF, Word, Excel, PowerPoint, Text, Images'), false);
                }
            } else {
                // Default: accept images only
                if (!file.mimetype.startsWith('image/')) {
                    return cb(new Error('Only image files are allowed!'), false);
                }
            }
            cb(null, true);
        }
    });
};

// Default upload for backward compatibility
const upload = createUploadMiddleware('default');

// Create folder in S3 (by uploading a placeholder file)
const createS3Folder = async (folderPath) => {
    const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET || 'geo-lms').trim();
    
    const params = {
        Bucket: bucketName,
        Key: `${folderPath}/.placeholder`,
        Body: '',
        ContentType: 'text/plain'
    };
    
    try {
        await s3.putObject(params).promise();
        console.log(`Created S3 folder: ${folderPath}`);
        return true;
    } catch (error) {
        console.error(`Error creating S3 folder ${folderPath}:`, error);
        throw error;
    }
};

// Delete object from S3
const deleteS3Object = async (key) => {
    const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET || 'geo-lms').trim();
    
    const params = {
        Bucket: bucketName,
        Key: key
    };
    
    try {
        await s3.deleteObject(params).promise();
        console.log(`Deleted S3 object: ${key}`);
        return true;
    } catch (error) {
        console.error(`Error deleting S3 object ${key}:`, error);
        throw error;
    }
};

// Delete folder and all its contents from S3
const deleteS3Folder = async (folderPath) => {
    const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET || 'geo-lms').trim();
    
    try {
        // List all objects in the folder
        const listParams = {
            Bucket: bucketName,
            Prefix: folderPath
        };
        
        const listedObjects = await s3.listObjectsV2(listParams).promise();
        
        if (listedObjects.Contents.length === 0) {
            console.log(`No objects found in folder: ${folderPath}`);
            return true;
        }
        
        // Delete all objects
        const deleteParams = {
            Bucket: bucketName,
            Delete: { Objects: [] }
        };
        
        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });
        
        await s3.deleteObjects(deleteParams).promise();
        console.log(`Deleted S3 folder and contents: ${folderPath}`);
        
        // If there were more objects, continue deleting
        if (listedObjects.IsTruncated) {
            await deleteS3Folder(folderPath);
        }
        
        return true;
    } catch (error) {
        console.error(`Error deleting S3 folder ${folderPath}:`, error);
        throw error;
    }
};

module.exports = { 
    upload, 
    s3, 
    createUploadMiddleware,
    createS3Folder,
    deleteS3Object,
    deleteS3Folder,
    generateS3Key
};
