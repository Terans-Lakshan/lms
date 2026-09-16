// One-off cleanup for accounts created by the old signup flow, which wrote a user
// document before the email was confirmed. Those rows can never log in, and they
// hold the email and registration number hostage so the person cannot sign up again.
//
// New signups no longer produce them: a signup now waits in the pendingusers
// collection and only becomes a user once its OTP is verified.
//
// Usage:
//   node scripts/cleanupUnverifiedUsers.js            list what would be deleted
//   node scripts/cleanupUnverifiedUsers.js --delete   actually delete them
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.js';

dotenv.config();

const shouldDelete = process.argv.includes('--delete');

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not set. Nothing to do.');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

    const unverified = await User.find({ isVerified: false })
        .select('name email registrationNo role createdAt')
        .sort({ createdAt: 1 });

    if (!unverified.length) {
        console.log('No unverified accounts found.');
        await mongoose.disconnect();
        return;
    }

    console.log(`\nUnverified accounts: ${unverified.length}\n`);
    unverified.forEach((u, i) => {
        console.log(
            `${String(i + 1).padStart(3)}. ${u.email}` +
            `  regNo=${u.registrationNo}` +
            `  role=${u.role}` +
            `  created=${u.createdAt ? u.createdAt.toISOString().slice(0, 10) : 'unknown'}`
        );
    });

    if (!shouldDelete) {
        console.log('\nDry run. Nothing was deleted.');
        console.log('Re-run with --delete to remove these accounts.');
        await mongoose.disconnect();
        return;
    }

    const result = await User.deleteMany({ isVerified: false });
    console.log(`\nDeleted ${result.deletedCount} unverified account(s).`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error('Cleanup failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
