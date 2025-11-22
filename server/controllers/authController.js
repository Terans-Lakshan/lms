const User = require('../models/user.js');
const { hashPassword,comparePassword } = require('../middlewares/auth.js');
const jwt = require('jsonwebtoken');

const test = (req,res)=>{
    res.send("Auth route working");
}

const registerUser = async (req,res)=>{
    try{
        const {firstName,lastName,email,password,role} = req.body;

        // Check if email is onlis20433@sci.pdn.ac.lk and assign admin role
        let userRole = role;
        if (email === 'onlis20433@sci.pdn.ac.lk') {
            userRole = 'admin';
        }
        // check if name was entered
        if(!firstName || !lastName){
            return res.status(400).json({message:"First and last name are required"});
        }
        // check if password were entered
        if(!password || password.length<8){
            return res.status(400).json({message:"Password is required and should be at least 8 characters long"});
        }

        // check if email was entered
        const exist=await User.findOne({email});
        if(exist){
            return res.json({message:"Email is taken Already"});
        }
        
        const hashedPassword=await hashPassword(password);
        
        // Extract registration number from email (everything before @)
        const registrationNo = email.split('@')[0];
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Create user with unverified status
        const user=await User.create({
            name:{first:firstName,last:lastName},
            email,
            registrationNo,
            password: hashedPassword,
            role: userRole,
            isVerified: false,
            otp,
            otpExpires
        });
        
        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'teranslakshan1@gmail.com',
                pass: 'khqcagejzjlpxguf'
            }
        });
        
        const mailOptions = {
            from: 'teranslakshan1@gmail.com',
            to: email,
            subject: 'Email Verification OTP - GeoLMS',
            html: `
                <h2>Welcome to GeoLMS!</h2>
                <p>Hello ${firstName},</p>
                <p>Thank you for signing up. Your OTP for email verification is:</p>
                <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10b981; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't sign up for this account, please ignore this email.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log('OTP sent to:', email);
        
        res.status(201).json({message: "Registration successful! Please check your email for OTP.", email});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Server error during registration"});
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;   
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No user found" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email with OTP before logging in" });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid  password" });
        }
        // res.status(200).json({ message: "Login successful", user });
        jwt.sign({email: user.email, id: user._id, name: user.name, role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'}, (err, token) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Error generating token" });
            }
            res.cookie('token', token).status(200).json({ message: "Login successful", user, token });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error during login" });
    }
}

const getProfile = async (req, res) => {
    try {
        // Check for token in cookies or Authorization header
        let token = req.cookies.token;
        
        if (!token) {
            const authHeader = req.headers['authorization'];
            token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        }
        
        if(token){
            jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
                if(err) {
                    console.log('JWT verification error:', err);
                    return res.json(null);
                }
                res.json(user)
            })
        }else{
            res.json(null)
        }
    } catch (error) {
        console.log('Profile error:', error);
        res.status(500).json({error: 'Error fetching profile'});
    }
}



const nodemailer = require('nodemailer');

const forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // Generate reset token
        const token = jwt.sign({email: user.email, id: user._id}, process.env.JWT_SECRET, {expiresIn: '15m'});
        const resetLink = `http://localhost:5173/reset-password?token=${token}`;

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'teranslakshan1@gmail.com',
                pass: 'khqcagejzjlpxguf'
            }
        });

        // Email options
        const mailOptions = {
            from: 'teranslakshan1@gmail.com',
            to: email,
            subject: 'Password Reset Request - GeoLMS',
            html: `
                <h2>Password Reset Request</h2>
                <p>Hello ${user.name.first},</p>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);

        res.status(200).json({ message: "Password reset instructions sent to your email" });
    } catch (error) {
        console.log('Error in forgetPassword:', error);
        res.status(500).json({ error: "Server error during password reset" });
    }
}

const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by email from token
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(password);
        
        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.log('Error in resetPassword:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: "Invalid or expired reset link" });
        }
        res.status(500).json({ error: "Server error during password reset" });
    }
}

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP not found. Please request a new one." });
        }

        if (new Date() > user.otpExpires) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        console.log('Error in verifyOtp:', error);
        res.status(500).json({ error: "Server error during OTP verification" });
    }
}

const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        
        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'teranslakshan1@gmail.com',
                pass: 'khqcagejzjlpxguf'
            }
        });
        
        const mailOptions = {
            from: 'teranslakshan1@gmail.com',
            to: email,
            subject: 'Email Verification OTP - GeoLMS',
            html: `
                <h2>GeoLMS Email Verification</h2>
                <p>Hello ${user.name.first},</p>
                <p>Your new OTP for email verification is:</p>
                <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10b981; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log('New OTP sent to:', email);

        res.status(200).json({ message: "New OTP sent to your email" });
    } catch (error) {
        console.log('Error in resendOtp:', error);
        res.status(500).json({ error: "Server error during OTP resend" });
    }
}

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -otp -otpExpires')
      .populate('degreeProgram', 'title code')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {test, registerUser, loginUser, getProfile, forgetPassword, resetPassword, verifyOtp, resendOtp, getAllUsers};