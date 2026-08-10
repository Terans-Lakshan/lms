// const express = require('express');
// const router = express.Router();
// const cors = require('cors');
// const { upload, uploadFiles, getImage, uploadLargeFile, getAllProjects, getProjectFiles } = require('../controllers/s3Controller');
import { Router } from 'express';
import { upload, uploadFiles, getImage, uploadLargeFile, getAllProjects, getProjectFiles } from '../controllers/s3Controller.js';
import cors from 'cors';
import express from 'express';
import Router from 'express';
const router = Router();

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.post('/upload', upload.array('files', 2), uploadFiles);
router.get('/image/:key', getImage);
router.post('/upload-large', uploadLargeFile);
router.get('/projects', getAllProjects);
router.get('/projects/:projectName/files', getProjectFiles);

export default router;
