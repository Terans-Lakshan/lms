const DegreeProgram = require('../models/degreeProgramme.js');
const Enrollment = require('../models/enrollment.js');
const Course = require('../models/course.js');
const User = require('../models/user.js');
const DegreeUser = require('../models/degreeUser.js');

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
        const userId = req.user.id;
        console.log('=== getMyEnrolledPrograms ===');
        console.log('User ID from token:', userId);

        // Find the DegreeUser document for this user
        const degreeUser = await DegreeUser.findOne({ userId })
            .populate({
                path: 'degrees.degreeId',
                populate: [{
                    path: 'courses',
                    select: 'title code credit description'
                }, {
                    path: 'lecturers',
                    select: 'name email'
                }]
            });
        
        if (!degreeUser || !degreeUser.degrees || degreeUser.degrees.length === 0) {
            console.log('No enrolled programs found');
            return res.status(200).json([]);
        }

        console.log('Found degrees:', degreeUser.degrees.length);
        
        // Filter only active degrees and return the populated degree programs
        const activePrograms = degreeUser.degrees
            .filter(degree => degree.status === 'active')
            .map(degree => degree.degreeId);
        
        res.status(200).json(activePrograms);
    } catch (error) {
        console.error('Error fetching enrolled programs:', error);
        res.status(500).json({ error: "Server error fetching enrolled programs" });
    }
}

const assignLecturerToProgram = async (req, res) => {
    try {
        const { degreeProgramId, lecturerId } = req.body;
        
        if (!degreeProgramId || !lecturerId) {
            return res.status(400).json({ message: "Degree program ID and lecturer ID are required" });
        }

        // Find the degree program
        const degreeProgram = await DegreeProgram.findById(degreeProgramId);
        if (!degreeProgram) {
            return res.status(404).json({ message: "Degree program not found" });
        }

        // Check if lecturer exists
        const lecturer = await User.findById(lecturerId);
        if (!lecturer || lecturer.role !== 'lecturer') {
            return res.status(404).json({ message: "Lecturer not found" });
        }

        // Check if lecturer is already assigned
        if (degreeProgram.lecturers.includes(lecturerId)) {
            return res.status(400).json({ message: "Lecturer is already assigned to this program" });
        }

        // Add lecturer to degree program
        degreeProgram.lecturers.push(lecturerId);
        await degreeProgram.save();

        // Also update DegreeUser collection
        let degreeUser = await DegreeUser.findOne({ userId: lecturerId });
        
        if (!degreeUser) {
            degreeUser = new DegreeUser({
                userId: lecturerId,
                userName: `${lecturer.name.first} ${lecturer.name.last}`,
                userEmail: lecturer.email,
                userRole: 'lecturer',
                degrees: [{
                    degreeId: degreeProgramId,
                    degreeTitle: degreeProgram.title,
                    degreeCode: degreeProgram.code,
                    acceptedBy: req.user.id,
                    status: 'active'
                }]
            });
        } else {
            const degreeExists = degreeUser.degrees.some(
                deg => deg.degreeId.toString() === degreeProgramId.toString()
            );
            
            if (!degreeExists) {
                degreeUser.degrees.push({
                    degreeId: degreeProgramId,
                    degreeTitle: degreeProgram.title,
                    degreeCode: degreeProgram.code,
                    acceptedBy: req.user.id,
                    status: 'active'
                });
            }
        }
        
        await degreeUser.save();

        const populatedProgram = await DegreeProgram.findById(degreeProgramId)
            .populate('lecturers', 'name email');

        res.status(200).json({ 
            message: "Lecturer assigned successfully", 
            degreeProgram: populatedProgram 
        });
    } catch (error) {
        console.error('Error assigning lecturer:', error);
        res.status(500).json({ error: "Server error assigning lecturer" });
    }
}

const deleteDegreeProgram = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and delete the degree program
        const degreeProgram = await DegreeProgram.findByIdAndDelete(id);
        
        if (!degreeProgram) {
            return res.status(404).json({ message: "Degree program not found" });
        }

        // Also clean up related data
        // Delete enrollments for this degree
        await Enrollment.deleteMany({ degreeProgram: id });
        
        // Remove from DegreeUser collection
        await DegreeUser.updateMany(
            { 'degrees.degreeId': id },
            { $pull: { degrees: { degreeId: id } } }
        );

        res.status(200).json({ 
            message: "Degree program deleted successfully",
            deletedProgram: degreeProgram
        });
    } catch (error) {
        console.error('Error deleting degree program:', error);
        res.status(500).json({ error: "Server error deleting degree program" });
    }
}

module.exports = {
    createDegreeProgram,
    getAllDegreePrograms,
    enrollInProgram,
    getPendingEnrollments,
    updateEnrollmentStatus,
    getMyEnrolledPrograms,
    assignLecturerToProgram,
    deleteDegreeProgram
};
