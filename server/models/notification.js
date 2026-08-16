//const mongoose = require('mongoose');
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['enrollment_request', 'enrollment_response', 'teach_request', 'teach_response', 'course_enrollment_request', 'course_enrollment_response'],
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requesterRole: {
    type: String,
    enum: ['student', 'lecturer', 'admin'],
    required: true
  },
  recipientRole: {
    type: String,
    enum: ['lecturer', 'admin'],
    default: null
  },
  degreeProgram: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DegreeProgram'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

export default mongoose.model('Notification', notificationSchema);