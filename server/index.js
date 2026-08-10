// //const express = require('express');
// import express from 'express';
// import cors from 'cors';
// //const cors = require('cors');
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import cookieParser from 'cookie-parser';
// // const dotenv = require('dotenv');
// // const mongoose = require('mongoose');
// // const cookieParser = require('cookie-parser');
// import passport from "./config/passport.js";
// dotenv.config();
// const app = express();

// app.use(passport.initialize());

// //middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
//   credentials: true
// }));

// app.use(passport.initialize());

// app.use(express.json());
// app.use(cookieParser());
// app.use(express.urlencoded({extended: false}));

// app.get("/", (req, res) => {
//     console.log("Root route called");
//     res.send("GeoLMS Backend Running");
// });

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/degree-programs', require('./routes/degreeProgramRoutes'));
// app.use('/api/courses', require('./routes/courseRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));
// app.use('/api/upload', require('./routes/uploadRoutes'));
// app.use('/api/degree-details', require('./routes/degreeDetailsRoutes'));
// app.use('/api/enrollments', require('./routes/enrollmentRoutes'));

// const PORT = process.env.PORT || 3000;

// // Database connection
// const mongoUri = process.env.MONGO_URI;

// if (!mongoUri) {
//   console.warn('MONGO_URI is not set. Starting server without database connection.');
//   startServer(false);
// } else {
//   mongoose.connect(mongoUri)
//     .then(() => {
//       console.log('Connected to MongoDB');
//       startServer(true);
//     })
//     .catch((err) => {
//       console.log('Failed to connect to MongoDB', err);
//       startServer(false);
//     });
// }

// function startServer(withDb = false) {
//   app.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}${withDb ? ' (with DB)' : ' (no DB)'}`);
//   });
// }



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
//import passport from "./config/passport.js";
// const exprees = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
// import passport from "./config/passport.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import degreeProgramRoutes from "./routes/degreeProgramRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import degreeDetailsRoutes from "./routes/degreeDetailsRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// ================================
// Middleware
// ================================

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : [
          "http://localhost:5173",
          "http://localhost:5174",
      ];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Passport
// app.use(passport.initialize());

// ================================
// Root Route
// ================================

app.get("/", (req, res) => {
    console.log("Root route called");
    res.send("GeoLMS Backend Running");
});

// ================================
// API Routes
// ================================

app.use("/api/auth", authRoutes);

app.use("/api/degree-programs", degreeProgramRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/degree-details", degreeDetailsRoutes);

app.use("/api/enrollments", enrollmentRoutes);

// ================================
// Server Configuration
// ================================

const PORT = process.env.PORT || 3000;

const mongoUri = process.env.MONGO_URI;

// ================================
// MongoDB Connection
// ================================

if (!mongoUri) {
    console.warn(
        "MONGO_URI is not set. Starting server without database connection."
    );

    startServer(false);
} else {
    mongoose
        .connect(mongoUri)
        .then(() => {
            console.log("Connected to MongoDB");
            startServer(true);
        })
        .catch((err) => {
            console.error("Failed to connect to MongoDB:", err);
            startServer(false);
        });
}

// ================================
// Start Server
// ================================

function startServer(withDb = false) {
    app.listen(PORT, () => {
        console.log(
            `Server listening on port ${PORT}${
                withDb ? " (with DB)" : " (no DB)"
            }`
        );
    });
}