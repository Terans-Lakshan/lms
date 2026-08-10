// const express = require('express');
// const router = express.Router();
// const cors = require('cors');
// const {test, registerUser, loginUser, getProfile,forgetPassword, resetPassword, verifyOtp, resendOtp, getAllUsers, getAllLecturers} = require('../controllers/authController');
// const { authenticateToken, isAdmin } = require('../middlewares/auth');

import express from 'express';
import { test,registerUser, loginUser, getProfile, forgetPassword, resetPassword, verifyOtp, resendOtp, getAllUsers, getAllLecturers } from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';
import cors from 'cors';
import { Router } from 'express';

const router = Router();

router.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174']
}));

router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.post('/forgetpassword', forgetPassword);
router.post('/resetpassword', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post("/resend-otp", resendOtp);

// Admin routes
router.get("/users", authenticateToken, isAdmin, getAllUsers);
router.get("/lecturers", authenticateToken, getAllLecturers);



export default router;