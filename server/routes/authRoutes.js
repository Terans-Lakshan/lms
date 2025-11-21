const express = require('express');
const router = express.Router();
const cors = require('cors');
const {test, registerUser, loginUser, getProfile,forgetPassword, resetPassword, verifyOtp, resendOtp} = require('../controllers/authController');


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
router.post('/resend-otp', resendOtp);

module.exports = router;