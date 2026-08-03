const aws = require('aws-sdk');
const { v4: uuid } = require('uuid');
const dotenv = require('dotenv');
const multer = require('multer');
const busboy = require('busboy');

dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3Uploadv2 = async (files) => {
  const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'geo-lms').trim();
  const params = files.map((file) => ({
    Bucket: bucketName,
    Key: `uploads/${uuid()}-${file.originalname}`,
    Body: file.buffer,
  }));

  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5, files: 2 } });

const uploadFiles = async (req, res) => {
  try {
    const results = await s3Uploadv2(req.files);
    return res.json({ status: 'success', results });
  } catch (err) {
    console.error('Error uploading files:', err);
    return res.status(500).json({ status: 'error', message: 'File upload failed', error: err.message });
  }
};

const getImage = (req, res) => {
  const key = req.params.key;
  const Bucket = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'geo-lms').trim();
  const region = (process.env.AWS_REGION || 'us-east-1').trim();

  if (!key) {
    return res.status(400).json({ message: 'Image key is required' });
  }

  const imageUrl = `https://${Bucket}.s3.${region}.amazonaws.com/${key}`;

  s3.headObject({ Bucket, Key: key }, (err) => {
    if (err && err.code === 'NotFound') {
      return res.status(404).json({ message: 'Image not found' });
    } else if (err) {
      return res.status(500).json({ message: 'Error checking image', error: err.message });
    }
    return res.json({ url: imageUrl });
  });
};

const uploadLargeFile = (req, res) => {
  try {
    const bb = busboy({ headers: req.headers });
    const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'geo-lms').trim();

    let projectName = '';
    let fileCount = 0;
    const uploadPromises = [];
    let hasError = false;

    bb.on('field', (name, value) => {
      if (name === 'projectName') {
        projectName = value.trim().replace(/\s+/g, '-').toLowerCase();
      }
    });

    bb.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;

      if (!filename || !projectName) {
        file.resume();
        return;
      }

      fileCount++;
      const s3Key = `uploads/projects/${projectName}/${Date.now()}-${filename}`;
      const params = { Bucket: bucketName, Key: s3Key, Body: file, ContentType: mimeType };

      const uploadPromise = s3.upload(params).promise().then((data) => ({
        originalName: filename,
        key: data.Key,
        location: data.Location,
      }));

      uploadPromises.push(uploadPromise);
    });

    bb.on('error', (error) => {
      console.error('Busboy error:', error);
      hasError = true;
      if (!res.headersSent) {
        res.status(400).json({ status: 'error', message: 'Request parsing error', error: error.message });
      }
    });

    bb.on('close', async () => {
      if (hasError || res.headersSent) return;
      
      if (!projectName) {
        return res.status(400).json({ status: 'error', message: 'projectName is required.' });
      }
      if (fileCount === 0) {
        return res.status(400).json({ status: 'error', message: 'No files uploaded.' });
      }
      try {
        const uploaded = await Promise.all(uploadPromises);
        return res.json({ status: 'success', folder: projectName, count: uploaded.length, result: uploaded });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: 'One or more files failed to upload.', error: err.message });
      }
    });

    req.pipe(bb);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error during upload.', error: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'geo-lms').trim();
    const params = { Bucket: bucketName, Prefix: 'uploads/projects/', Delimiter: '/' };
    const data = await s3.listObjectsV2(params).promise();
    const projects = data.CommonPrefixes?.map(p => p.Prefix.replace('uploads/projects/', '').replace('/', '')) || [];
    return res.json({ status: 'success', projects });
  } catch (error) {
    console.error('S3 LIST ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch projects', error: error.message });
  }
};

const getProjectFiles = async (req, res) => {
  try {
    const { projectName } = req.params;
    if (!projectName) {
      return res.status(400).json({ status: 'error', message: 'Project name required' });
    }
    const bucketName = (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'geo-lms').trim();
    const params = { Bucket: bucketName, Prefix: `uploads/projects/${projectName}/` };
    const data = await s3.listObjectsV2(params).promise();
    
    // Safely handle Contents array
    const files = (data.Contents || [])
      .filter(item => item.Key !== params.Prefix)
      .map(item => ({
        fileName: item.Key.replace(params.Prefix, ''),
        url: s3.getSignedUrl('getObject', { Bucket: bucketName, Key: item.Key, Expires: 3600 })
      }));
    res.json({ status: 'success', files });
  } catch (error) {
    console.error('S3 FILE LIST ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch project files', error: error.message });
  }
};

module.exports = { upload, uploadFiles, getImage, uploadLargeFile, getAllProjects, getProjectFiles };
