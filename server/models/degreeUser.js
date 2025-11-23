const mongoose = require('mongoose');

const degreeUserSchema = new mongoose.Schema({
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
    degrees: [{
        degreeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DegreeProgram',
            required: true
        },
        degreeTitle: {
            type: String,
            required: true
        },
        degreeCode: {
            type: String,
            required: true
        },
        acceptedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'inactive'],
            default: 'active'
        },
        acceptedBy: {
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

degreeUserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DegreeUser', degreeUserSchema);
