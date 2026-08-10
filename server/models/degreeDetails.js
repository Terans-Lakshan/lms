//const mongoose = require('mongoose');
import mongoose from 'mongoose';
export const degreeDetailsSchema = new mongoose.Schema({
    studentRegistrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    degrees: [{
        degreeName: {
            type: String,
            required: true
        },
        courses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }]
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

degreeDetailsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// export default mongoose.model('DegreeDetails', degreeDetailsSchema);
export default degreeDetailsSchema;