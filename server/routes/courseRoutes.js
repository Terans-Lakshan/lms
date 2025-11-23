const express = require('express');
const router = express.Router();
const cors = require('cors');
const { authenticateToken } = require('../middlewares/auth');
const {
    updateCourse,
    getCourse,
    getAllCourses,
    deleteCourse
} = require('../controllers/courseController');

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.get('/', getAllCourses);
router.get('/:id', getCourse);
router.put('/:id', authenticateToken, updateCourse);
router.delete('/:id', authenticateToken, deleteCourse);

module.exports = router;
