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

// Configure multer to use S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET || 'geo-lms').trim(),
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = file.originalname.split('.').pop();
            cb(null, `degree-images/${uniqueSuffix}.${extension}`);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

module.exports = { upload, s3 };
