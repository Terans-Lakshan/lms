// models/DegreeProgram.js
//const mongoose = require("mongoose");
import mongoose from "mongoose";

const DegreeProgramSchema = new mongoose.Schema({
  title: String,
  code: String,
  description: String,
  previewImage: { type: String, required: false },
  adminNotes: String,
  lecturers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // assigned lecturers
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});
export default mongoose.model("DegreeProgram", DegreeProgramSchema);
