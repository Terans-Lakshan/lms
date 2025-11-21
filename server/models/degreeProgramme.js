// models/DegreeProgram.js
const mongoose = require("mongoose");
const DegreeProgramSchema = new mongoose.Schema({
  title: String,
  code: String,
  description: String,
  adminNotes: String,
  lecturers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // assigned lecturers
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});
module.exports = mongoose.model("DegreeProgram", DegreeProgramSchema);
