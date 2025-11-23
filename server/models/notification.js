const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['enrollment_request', 'enrollment_response', 'teach_request', 'teach_response'],
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterRole: {
    type: String,
    enum: ['student', 'lecturer', 'admin'],
    required: true
  },
  degreeProgram: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DegreeProgram',
    required: true
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

module.exports = mongoose.model('Notification', notificationSchema);