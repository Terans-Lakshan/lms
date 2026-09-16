// models/Course.js
// const mongoose = require("mongoose");
import mongoose from "mongoose";
const CourseSchema = new mongoose.Schema({
  title: String,
  code: String,
  credit: Number,
  degree: String,
  description: String,
  previewImage: { type: String, required: false },
  degreeType: { 
    type: String, 
    enum: ['masters', 'Ph.D.', 'M.Phil', 'post graduate diploma'],
    required: false
  },
  degreeProgram: { type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" },
  resources: [{
    type: { type: String, enum: ['file', 'link', 'message'], default: 'file' }, // Material type
    key: String,        // S3 object key (for files only)
    url: String,        // public/presigned URL (for files) or external link URL
    filename: String,   // Original filename (for files), link title, or message subject
    content: String,    // Message body (for messages only)
    mimeType: String,   // MIME type (for files only)
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  }],
});
// module.exports = mongoose.model("Course", CourseSchema);
export default mongoose.model("Course", CourseSchema);