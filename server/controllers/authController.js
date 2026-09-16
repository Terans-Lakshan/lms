// const User = require('../models/user.js');
// const DegreeUser = require('../models/degreeUser.js');
// const { hashPassword,comparePassword } = require('../middlewares/auth.js');
// const jwt = require('jsonwebtoken');
// //const nodemailer = require('nodemailer');
// const axios = require('axios');

import User from '../models/User.js';
import PendingUser from '../models/pendingUser.js';
import DegreeUser from '../models/degreeUser.js';
import {comparePassword,hashPassword} from '../middlewares/auth.js';
//import hashPassword from '../middlewares/auth.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';



export const test = (req,res)=>{
    res.send("Auth route working");
}

export const sendResetPasswordLinkEmail = async(email, otp, name)=>{
    if(!process.env.GOOGLE_SCRIPT_URL){
        throw new Error("GOOGLE_SCRIPT_URL missing in .env");
    }

    const response = await axios.post(
        process.env.GOOGLE_SCRIPT_URL,
        {
            email,
            otp,
            name,
            type: "password-reset-otp"
        }
    );

    console.log("Password reset OTP mail response:", response.data);
    return response.data;
}
// using Google script to send email instead of nodemailer
export const sendOTPEmail = async(email, otp, firstName)=>{

    try{

        if(!process.env.GOOGLE_SCRIPT_URL){
            throw new Error("GOOGLE_SCRIPT_URL missing in .env");
        }

        const response = await axios.post(
            process.env.GOOGLE_SCRIPT_URL,
            {
                email,
                otp,
                name: firstName
            }
        );

        console.log("Google mail response:", response.data);

        return response.data;

    }
    catch(error){

        console.log("Google mail error:");

        if(error.response){
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        }
        else{
            console.log(error.message);
        }

        throw error;
    }

};

export const registerUser = async (req,res)=>{
    try{
        const {firstName,lastName,email,password,role} = req.body;

        // Check if email is s20433@sci.pdn.ac.lk and assign admin role
        let userRole = role;
        if (email === 's20433@sci.pdn.ac.lk') {
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

        // An account only exists once its email has been verified, so this never
        // trips on a signup somebody started and abandoned
        const exist=await User.findOne({email});
        if(exist){
            return res.status(409).json({message:"Email is taken Already"});
        }

        // Extract registration number from email (everything before @)
        const registrationNo = email.split('@')[0];

        // Two different addresses can share the prefix before the @, and the field is
        // unique, so reject the clash here instead of failing on the database index
        const registrationTaken = await User.findOne({ registrationNo });
        if (registrationTaken) {
            return res.status(409).json({ message: "This registration number is already used" });
        }

        const hashedPassword=await hashPassword(password);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // The signup is held outside the users collection until the OTP is confirmed.
        // Clearing any earlier pending signup lets somebody who never received the
        // first code start over with the same email.
        await PendingUser.deleteMany({ $or: [{ email }, { registrationNo }] });

        await PendingUser.create({
            name:{first:firstName,last:lastName},
            email,
            registrationNo,
            password: hashedPassword,
            role: userRole,
            otp,
            otpExpires,
            // Outlives the OTP so that "resend OTP" still works after the first
            // code expires; MongoDB drops the record once this passes
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });


        // Without the code the signup cannot be completed, so a mail failure clears
        // the pending record and reports the real reason rather than a bare 500
        try {
            await sendOTPEmail(
                email,
                otp,
                firstName
            );
        } catch (mailError) {
            await PendingUser.deleteOne({ email });
            console.log("Failed to send OTP email, pending signup removed:", email, mailError.message);
            return res.status(502).json({
                message: "Could not send the verification email. Please check the address and try again."
            });
        }

        console.log("OTP sent through Google Script:", email);
        // new add close
        res.status(201).json({message: "Registration successful! Please check your email for OTP.", email});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Server error during registration"});
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;   
        const user = await User.findOne({ email });
        if (!user) {
            // The account is not created until the OTP is confirmed, so a signup
            // still waiting on its code looks like a missing user here
            const pending = await PendingUser.findOne({ email });
            if (pending) {
                return res.status(403).json({
                    message: "Please verify your email with the OTP we sent before logging in",
                    requiresVerification: true,
                    email
                });
            }

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

export const getProfile = async (req, res) => {
    try {
        // Check for token in cookies or Authorization header
        let token = req.cookies.token;
        
        if (!token) {
            const authHeader = req.headers['authorization'];
            token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        }
        
        // A missing or rejected token is an authentication failure, so it answers 401.
        // Returning 200 with a null body made every caller read `.role` off null and
        // treat an expired session as a crash.
        if(!token){
            return res.status(401).json({ message: "Not authenticated" });
        }

        jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
            if(err) {
                console.log('JWT verification error:', err.message);
                return res.status(401).json({ message: "Session expired. Please log in again." });
            }
            res.json(user)
        })
    } catch (error) {
        console.log('Profile error:', error);
        res.status(500).json({error: 'Error fetching profile'});
    }
}



export const forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = resetOtp;
        user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendResetPasswordLinkEmail(
            email,
            resetOtp,
            user.name.first
        );
        console.log('Password reset email sent to:', email);

        res.status(200).json({ message: "Password reset OTP sent to your email" });
    } catch (error) {
        console.log('Error in forgetPassword:', error);
        res.status(500).json({ error: "Server error during password reset" });
    }
}

export const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.resetOtp || !user.resetOtpExpires) {
            return res.status(400).json({ message: "Invalid or expired reset OTP" });
        }
        if (new Date() > user.resetOtpExpires || user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid or expired reset OTP" });
        }

        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();

        const resetToken = jwt.sign(
            { email: user.email, id: user._id, purpose: "password-reset" },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        res.status(200).json({ message: "OTP verified", resetToken });
    } catch (error) {
        console.log('Error in verifyResetOtp:', error);
        res.status(500).json({ error: "Server error during OTP verification" });
    }
}

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.purpose !== "password-reset") {
            return res.status(400).json({ message: "Invalid password reset token" });
        }
        
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

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // A verified account already lives in the users collection
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const pending = await PendingUser.findOne({ email });
        if (!pending) {
            return res.status(404).json({ message: "No pending signup found for this email. Please sign up again." });
        }

        if (new Date() > pending.otpExpires) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        if (pending.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // The account is created only now that the email is confirmed. The password
        // was already hashed at signup, so it is carried over as it is.
        await User.create({
            name: pending.name,
            email: pending.email,
            registrationNo: pending.registrationNo,
            password: pending.password,
            role: pending.role,
            googleId: null,
            isVerified: true
        });

        await PendingUser.deleteOne({ _id: pending._id });

        console.log('Account created after OTP verification:', email);

        res.status(200).json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        console.log('Error in verifyOtp:', error);
        res.status(500).json({ error: "Server error during OTP verification" });
    }
}

export const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const user = await PendingUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No pending signup found for this email. Please sign up again." });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        // Give the pending signup a fresh 24 hours, so asking for another code does
        // not leave the record about to be dropped by the TTL index
        user.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();
        
        // Send OTP email
        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS
        //     }
        // });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
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
        
        // await transporter.sendMail(mailOptions);
        // console.log('New OTP sent to:', email);
        await sendOTPEmail(
            email,
            otp,
            user.name.first
        );

        res.status(200).json({ message: "New OTP sent to your email" });
    } catch (error) {
        console.log('Error in resendOtp:', error);
        res.status(500).json({ error: "Server error during OTP resend" });
    }
}

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find()
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    
    // Fetch degree enrollments from DegreeUser model
    const usersWithDegrees = await Promise.all(
      users.map(async (user) => {
        try {
          const userObj = user.toObject();
          
          // Get all degrees this user is enrolled in from DegreeUser model
          const degreeUserData = await DegreeUser.findOne({ userId: user._id })
            .select('degrees');
          
          // Add enrolled degrees to user object
          userObj.enrolledDegrees = degreeUserData?.degrees || [];
          
          return userObj;
        } catch (err) {
          console.error(`Error processing user ${user._id}:`, err);
          // Return user without degree data if there's an error
          const userObj = user.toObject();
          userObj.enrolledDegrees = [];
          return userObj;
        }
      })
    );
    
    console.log('Successfully processed all users with degree data');
    res.json(usersWithDegrees);
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all lecturers (admin only)
export const getAllLecturers = async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'lecturer', isVerified: true })
      .select('name email registrationNo')
      .sort({ 'name.first': 1 });
    
    res.json(lecturers);
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// export default { test, registerUser, loginUser, getProfile, forgetPassword, resetPassword, verifyOtp, resendOtp, getAllUsers, getAllLecturers };