const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        first: String,
        last: String
    },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;