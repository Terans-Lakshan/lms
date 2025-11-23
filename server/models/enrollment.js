const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    degreeProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram', required: true },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'approved', 'rejected', 'inactive', 'completed'], 
        default: 'active' 
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
