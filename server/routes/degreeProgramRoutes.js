const express = require('express');
const router = express.Router();
const cors = require('cors');
const { authenticateToken } = require('../middlewares/auth');
const {
    createDegreeProgram,
    getAllDegreePrograms,
    enrollInProgram,
    getPendingEnrollments,
    updateEnrollmentStatus,
    getMyEnrolledPrograms
} = require('../controllers/degreeProgramController');

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.post('/', createDegreeProgram);
router.get('/', getAllDegreePrograms);
router.post('/enroll', enrollInProgram);
router.get('/enrollments/pending', getPendingEnrollments);
router.post('/enrollments/update', updateEnrollmentStatus);
router.get('/enrollments/my-programs', authenticateToken, getMyEnrolledPrograms);
router.get('/my-enrollments', authenticateToken, getMyEnrolledPrograms);

module.exports = router;
