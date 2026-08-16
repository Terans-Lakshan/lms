// const express = require('express');
// const router = express.Router();
// const cors = require('cors');
// const { authenticateToken, isAdmin } = require('../middlewares/auth');
// const {
//     createDegreeProgram,
//     updateDegreeProgram,
//     getAllDegreePrograms,
//     enrollInProgram,
//     getPendingEnrollments,
//     updateEnrollmentStatus,
//     getMyEnrolledPrograms,
//     assignLecturerToProgram,
//     deleteDegreeProgram,
//     addCourseToDegree
// } = require('../controllers/degreeProgramController');

import express from 'express';
import cors from 'cors';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';
import { createDegreeProgram, updateDegreeProgram, getAllDegreePrograms, enrollInProgram, getPendingEnrollments, updateEnrollmentStatus, getMyEnrolledPrograms, assignLecturerToProgram, unassignLecturerFromProgram, deleteDegreeProgram, addCourseToDegree } from '../controllers/degreeProgramController.js'; 
import { Router } from 'express';

const router = Router();

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.post('/', authenticateToken, isAdmin, createDegreeProgram);
router.put('/:id', authenticateToken, isAdmin, updateDegreeProgram);
router.get('/', getAllDegreePrograms);
router.post('/enroll', authenticateToken, enrollInProgram);
router.get('/enrollments/pending', authenticateToken, isAdmin, getPendingEnrollments);
router.post('/enrollments/update', authenticateToken, isAdmin, updateEnrollmentStatus);
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
router.post('/unassign-lecturer', authenticateToken, unassignLecturerFromProgram);
router.post('/add-course', authenticateToken, addCourseToDegree);
router.delete('/:id', authenticateToken, deleteDegreeProgram);

export default router;
