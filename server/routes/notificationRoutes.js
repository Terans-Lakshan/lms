const express = require('express');
const router = express.Router();
const {
  getAdminNotifications,
  handleEnrollmentRequest,
  createEnrollmentRequest,
  getStudentNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// Student creates enrollment request (requires authentication)
router.post('/enrollment-request', authenticateToken, createEnrollmentRequest);

// Student gets their notifications (requires authentication)
router.get('/student', authenticateToken, getStudentNotifications);

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, markNotificationAsRead);

// Admin gets notifications (requires authentication and admin role)
router.get('/admin', authenticateToken, isAdmin, getAdminNotifications);

// Admin handles enrollment request (requires authentication and admin role)
router.post('/handle-request', authenticateToken, isAdmin, handleEnrollmentRequest);

module.exports = router;