// models/Course.js
const mongoose = require("mongoose");
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
    key: String,        // S3 object key
    url: String,        // public or presigned URL
    filename: String,
    mimeType: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  }],
});
module.exports = mongoose.model("Course", CourseSchema);
