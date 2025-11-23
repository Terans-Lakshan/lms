const mongoose = require('mongoose');

const degreeUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
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
        degreeCode: {
            type: String,
            required: true
        },
        
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
