const express = require('express');
const router = express.Router();
const cors = require('cors');
const { upload, uploadFiles, getImage, uploadLargeFile, getAllProjects, getProjectFiles } = require('../controllers/s3Controller');

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.post('/upload', upload.array('files', 2), uploadFiles);
router.get('/image/:key', getImage);
router.post('/upload-large', uploadLargeFile);
router.get('/projects', getAllProjects);
router.get('/projects/:projectName/files', getProjectFiles);

module.exports = router;
