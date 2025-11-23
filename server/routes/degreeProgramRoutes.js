const express = require('express');
const router = express.Router();
const cors = require('cors');
const { authenticateToken } = require('../middlewares/auth');
const {
    createDegreeProgram,
    updateDegreeProgram,
    getAllDegreePrograms,
    enrollInProgram,
    getPendingEnrollments,
    updateEnrollmentStatus,
    getMyEnrolledPrograms,
    assignLecturerToProgram,
    deleteDegreeProgram,
    addCourseToDegree
} = require('../controllers/degreeProgramController');

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.post('/', createDegreeProgram);
router.put('/:id', authenticateToken, updateDegreeProgram);
router.get('/', getAllDegreePrograms);
router.post('/enroll', enrollInProgram);
router.get('/enrollments/pending', getPendingEnrollments);
router.post('/enrollments/update', updateEnrollmentStatus);
router.get('/enrollments/my-programs', authenticateToken, getMyEnrolledPrograms);
router.get('/my-enrollments', authenticateToken, getMyEnrolledPrograms);
router.get('/debug-degree-user', authenticateToken, async (req, res) => {
    try {
        const DegreeUser = require('../models/degreeUser');
        const degreeUser = await DegreeUser.findOne({ userId: req.user.id });
        res.json({
            userId: req.user.id,
            degreeUserExists: !!degreeUser,
            degreeUser: degreeUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/assign-lecturer', authenticateToken, assignLecturerToProgram);
router.post('/add-course', authenticateToken, addCourseToDegree);
router.delete('/:id', authenticateToken, deleteDegreeProgram);

module.exports = router;
