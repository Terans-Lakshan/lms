// const express = require('express');
// const router = express.Router();
// const cors = require('cors');
// const { authenticateToken } = require('../middlewares/auth');
// const {
//     addMaterialLink,
//     updateCourse,
//     getCourse,
//     getAllCourses,
//     deleteCourse
// } = require('../controllers/courseController');
import express from 'express';
import cors from 'cors';
import { addMaterialLink, addMaterialMessage, downloadMaterial, updateMaterial, deleteMaterial, updateCourse, getCourse, getAllCourses, deleteCourse } from '../controllers/courseController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { Router } from 'express';
const router = Router();

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.get('/', getAllCourses);
// Declared before '/:id' for clarity; it is a four segment path so it cannot clash
router.get('/:courseId/materials/:resourceId/download', authenticateToken, downloadMaterial);
router.put('/:courseId/materials/:resourceId', authenticateToken, updateMaterial);
router.delete('/:courseId/materials/:resourceId', authenticateToken, deleteMaterial);
router.get('/:id', getCourse);
router.put('/:id', authenticateToken, updateCourse);
router.delete('/:id', authenticateToken, deleteCourse);
router.post('/add-material-link', authenticateToken, addMaterialLink);
router.post('/add-material-message', authenticateToken, addMaterialMessage);

export default router;
