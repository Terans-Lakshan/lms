// const express = require('express');
// const router = express.Router();
// const {
//   getAdminNotifications,
//   handleEnrollmentRequest,
//   createEnrollmentRequest,
//   createTeachRequest,
//   getStudentNotifications,
//   getLecturerNotifications,
//   deleteNotification
// } = require('../controllers/notificationController');
// const { authenticateToken, isAdmin } = require('../middlewares/auth');

import express from 'express';
import { getAdminNotifications, handleEnrollmentRequest, createEnrollmentRequest, createTeachRequest, getStudentNotifications, getLecturerNotifications, deleteNotification } from '../controllers/notificationController.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';
import { Router } from 'express';

const router = Router();

// Student routes
router.post('/enrollment-request', authenticateToken, createEnrollmentRequest);
router.get('/student', authenticateToken, getStudentNotifications);

// Lecturer routes
router.post('/teach-request', authenticateToken, createTeachRequest);
router.get('/lecturer', authenticateToken, getLecturerNotifications);

// Delete notification (both student and lecturer)
router.delete('/:id', authenticateToken, deleteNotification);

// Admin routes
router.get('/admin', authenticateToken, isAdmin, getAdminNotifications);
router.post('/handle-request', authenticateToken, isAdmin, handleEnrollmentRequest);

export default router;