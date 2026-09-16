import mongoose from 'mongoose';

const { Schema } = mongoose;

// A signup that has not been confirmed by OTP yet.
// Nothing is written to the users collection until the OTP is verified, so an
// abandoned signup never becomes an account and never occupies the email or the
// registration number. Records here clean themselves up through the TTL index on
// expiresAt, so the collection cannot grow without bound.
const pendingUserSchema = new Schema({
    name: {
        first: String,
        last: String
    },
    email: { type: String, unique: true, required: true },
    registrationNo: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // already hashed
    role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    // How long the signup itself stays around. Kept longer than the OTP so that
    // "resend OTP" still works after the first code has expired.
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // MongoDB deletes the document once this time passes
    }
}, { timestamps: true });

const PendingUser = mongoose.models.PendingUser || mongoose.model('PendingUser', pendingUserSchema);
export default PendingUser;
