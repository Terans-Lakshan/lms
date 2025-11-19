const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('cookie-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

//middleware
app.use(cors({
  origin: 'http://localhost:5173',  // your React frontend origin
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth (must come before passport.initialize)
app.use(session({
  name: 'session',
  keys: ['secretkey'],  // ideally use env variable for secret
  maxAge: 24 * 60 * 60 * 1000, // 1 day
}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  startServer(true);
})
.catch((err) => {
  console.log('Failed to connect to MongoDB', err);
  startServer(false);
});

function startServer(withDb = false) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}${withDb ? ' (with DB)' : ' (no DB)'}`);
  });
}

// Existing routes
app.use('/', require('./routes/authRoutes'));

// ------------------- GOOGLE OAUTH ---------------------

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:${PORT}/auth/google/callback`
},
(accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Redirect user to Google for login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    const email = req.user.emails[0].value;

    // Restrict to specific domain
    if (!email.endsWith('@sci.pdn.ac.lk')) {
      return res.redirect('http://localhost:5173/signup?error=invalid_domain');
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store in session
    req.session.otp = otp;
    req.session.email = email;

    // Send OTP email
    sendOTP(email, otp);

    // Redirect user to OTP verify page on frontend
    res.redirect('http://localhost:5173/verify-otp');
  }
);

// Send OTP email using nodemailer
function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    }
  });

  transporter.sendMail({
    from: 'LMS <no-reply@lms.com>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  }, (err, info) => {
    if (err) console.error('Error sending OTP email:', err);
    else console.log('OTP sent:', info.response);
  });
}

// Verify OTP endpoint
app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;

  if (otp === req.session.otp) {
    const token = jwt.sign({ email: req.session.email }, process.env.JWT_SECRET || 'jwtsecretkey');
    return res.json({ success: true, token });
  }

  res.status(401).json({ success: false, error: 'Invalid OTP' });
});
