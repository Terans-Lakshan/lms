const DegreeProgram = require('../models/degreeProgramme.js');
const Enrollment = require('../models/enrollment.js');
const Course = require('../models/course.js');
const User = require('../models/user.js');

const createDegreeProgram = async (req, res) => {
    try {
        const { title, code, description, previewImage, adminNotes } = req.body;

        // Check if degree program with the same code already exists
        const existingProgram = await DegreeProgram.findOne({ code });
        if (existingProgram) {
            return res.status(400).json({ message: "A degree program with this code already exists" });
        }

        // Create new degree program
        const degreeProgram = await DegreeProgram.create({
            title,
            code,
            description,
            previewImage: previewImage || '',
            adminNotes: adminNotes || ''
        });

        res.status(201).json({ 
            message: "Degree program created successfully", 
            degreeProgram 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error creating degree program" });
    }
}

const getAllDegreePrograms = async (req, res) => {
    try {
        const programs = await DegreeProgram.find()
            .populate('lecturers', 'name email')
            .populate('courses', 'title code');
        res.status(200).json(programs);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error fetching degree programs" });
    }
}

const enrollInProgram = async (req, res) => {
    try {
        const { studentId, degreeProgramId } = req.body;

        // Check if enrollment request already exists
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            degreeProgram: degreeProgramId
        });

        if (existingEnrollment) {
            if (existingEnrollment.status === 'approved') {
                return res.status(400).json({ message: "You are already enrolled in this program" });
            }
            if (existingEnrollment.status === 'pending') {
                return res.status(400).json({ message: "Your enrollment request is pending approval" });
            }
        }

        // Create new enrollment request
        const enrollment = await Enrollment.create({
            student: studentId,
            degreeProgram: degreeProgramId,
            status: 'pending'
        });

        await enrollment.populate('student', 'name email registrationNo');
        await enrollment.populate('degreeProgram', 'title code');

        res.status(201).json({ 
            message: "Enrollment request submitted successfully. Awaiting admin approval.", 
            enrollment 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error during enrollment" });
    }
}

const getPendingEnrollments = async (req, res) => {
    try {
        const pendingEnrollments = await Enrollment.find({ status: 'pending' })
            .populate('student', 'name email registrationNo')
            .populate('degreeProgram', 'title code')
            .sort({ requestedAt: -1 });
        
        res.status(200).json(pendingEnrollments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error fetching pending enrollments" });
    }
}

const updateEnrollmentStatus = async (req, res) => {
    try {
        const { enrollmentId, status, adminId } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const enrollment = await Enrollment.findByIdAndUpdate(
            enrollmentId,
            {
                status,
                processedAt: new Date(),
                processedBy: adminId
            },
            { new: true }
        ).populate('student', 'name email registrationNo')
         .populate('degreeProgram', 'title code');

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment request not found" });
        }

        res.status(200).json({ 
            message: `Enrollment ${status} successfully`, 
            enrollment 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error updating enrollment status" });
    }
}

const getMyEnrolledPrograms = async (req, res) => {
    try {
        const { studentId } = req.query;

        const enrolledPrograms = await Enrollment.find({ 
            student: studentId, 
            status: 'active' 
        })
            .populate({
                path: 'degreeProgram',
                populate: [{
                    path: 'courses',
                    select: 'title code credit'
                }, {
                    path: 'lecturers',
                    select: 'name email'
                }]
            })
            .sort({ createdAt: -1 });
        
        res.status(200).json(enrolledPrograms);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error fetching enrolled programs" });
    }
}

module.exports = {
    createDegreeProgram,
    getAllDegreePrograms,
    enrollInProgram,
    getPendingEnrollments,
    updateEnrollmentStatus,
    getMyEnrolledPrograms
};
