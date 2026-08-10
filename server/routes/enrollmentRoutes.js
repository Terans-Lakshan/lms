// const express = require('express');
// const router = express.Router();
// const cors = require('cors');
// const { authenticateToken } = require('../middlewares/auth');
// const {
//   enrollInCourse,
//   unenrollFromCourse,
//   getEnrolledCourses,
//   getCourseEnrollmentStatus,
//   handleCourseEnrollmentRequest
// } = require('../controllers/enrollmentController');

import express from 'express';
import cors from 'cors';
import { authenticateToken } from '../middlewares/auth.js';
import {enrollInCourse, unenrollFromCourse, getEnrolledCourses, getCourseEnrollmentStatus, handleCourseEnrollmentRequest} from '../controllers/enrollmentController.js';
import { Router } from 'express';
const router = Router();

router.use(cors({
  credentials: true,
  origin: ['http://localhost:5173', 'http://localhost:5174']
}));

// Course enrollment routes
router.post('/course', authenticateToken, enrollInCourse);
router.delete('/course', authenticateToken, unenrollFromCourse);
router.get('/my-courses', authenticateToken, getEnrolledCourses);
router.get('/course-status/:courseId', authenticateToken, getCourseEnrollmentStatus);
router.post('/handle-course-request', authenticateToken, handleCourseEnrollmentRequest);

export default router;
