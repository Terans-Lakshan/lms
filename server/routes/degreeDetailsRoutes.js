const express = require('express');
const router = express.Router();
const cors = require('cors');
const { authenticateToken } = require('../middlewares/auth');
const {
    runMigration,
    getStudentDegreeDetails,
    getMyDegreeDetails,
    syncStudent,
    addCourse,
    removeCourse
} = require('../controllers/degreeDetailsController');

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

// Run migration (Admin only)
router.post('/migrate', authenticateToken, runMigration);

// Get current user's degree details (Students)
router.get('/my-details', authenticateToken, getMyDegreeDetails);

// Get degree details by registration number (Admin only)
router.get('/student/:registrationNo', authenticateToken, getStudentDegreeDetails);

// Sync specific student data (Admin only)
router.post('/sync/:studentId', authenticateToken, syncStudent);

// Add course to student's degree (Admin only)
router.post('/add-course', authenticateToken, addCourse);

// Remove course from student's degree (Admin only)
router.post('/remove-course', authenticateToken, removeCourse);

module.exports = router;
