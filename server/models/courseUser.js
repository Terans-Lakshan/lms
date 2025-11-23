const mongoose = require('mongoose');

const courseUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['student', 'lecturer'],
        required: true
    },
    courses: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        courseTitle: {
            type: String,
            required: true
        },
        courseCode: {
            type: String,
            required: true
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'inactive'],
            default: 'active'
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

courseUserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('CourseUser', courseUserSchema);
