const DegreeDetails = require('../models/degreeDetails');
const { 
    migrateToDegreeDetails, 
    syncStudentDegreeDetails,
    addCourseToStudentDegree,
    removeCourseFromStudentDegree
} = require('../utils/degreeDetailsMigration');

// Run migration from DegreeUser and CourseUser to DegreeDetails
const runMigration = async (req, res) => {
    try {
        console.log('Migration endpoint called by:', req.user.email);
        
        // Only allow admin to run migration
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can run migration' });
        }

        const result = await migrateToDegreeDetails();
        res.status(200).json({ 
            message: 'Migration completed successfully',
            ...result
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: 'Migration failed', details: error.message });
    }
};

// Get degree details for a specific student
const getStudentDegreeDetails = async (req, res) => {
    try {
        const { registrationNo } = req.params;
        
        const degreeDetails = await DegreeDetails.findOne({ 
            studentRegistrationNumber: registrationNo 
        }).populate('degrees.courses', 'title code credit description');

        if (!degreeDetails) {
            return res.status(404).json({ error: 'Degree details not found for this student' });
        }

        res.status(200).json(degreeDetails);
    } catch (error) {
        console.error('Error fetching degree details:', error);
        res.status(500).json({ error: 'Server error fetching degree details' });
    }
};

// Get current user's degree details (for students)
const getMyDegreeDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const User = require('../models/user');
        
        const user = await User.findById(userId);
        if (!user || user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access this endpoint' });
        }

        const degreeDetails = await DegreeDetails.findOne({ 
            studentRegistrationNumber: user.registrationNo 
        }).populate('degrees.courses', 'title code credit description');

        if (!degreeDetails) {
            return res.status(404).json({ error: 'Degree details not found' });
        }

        res.status(200).json(degreeDetails);
    } catch (error) {
        console.error('Error fetching degree details:', error);
        res.status(500).json({ error: 'Server error fetching degree details' });
    }
};

// Sync a specific student's data
const syncStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Only admin can sync
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can sync student data' });
        }

        const degreeDetails = await syncStudentDegreeDetails(studentId);
        res.status(200).json({ 
            message: 'Student data synced successfully',
            degreeDetails
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    }
};

// Add course to student's degree
const addCourse = async (req, res) => {
    try {
        const { studentRegistrationNo, degreeName, courseId } = req.body;
        
        // Only admin can add courses
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can add courses' });
        }

        const degreeDetails = await addCourseToStudentDegree(
            studentRegistrationNo, 
            degreeName, 
            courseId
        );

        res.status(200).json({ 
            message: 'Course added successfully',
            degreeDetails
        });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: error.message });
    }
};

// Remove course from student's degree
const removeCourse = async (req, res) => {
    try {
        const { studentRegistrationNo, degreeName, courseId } = req.body;
        
        // Only admin can remove courses
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can remove courses' });
        }

        const degreeDetails = await removeCourseFromStudentDegree(
            studentRegistrationNo, 
            degreeName, 
            courseId
        );

        res.status(200).json({ 
            message: 'Course removed successfully',
            degreeDetails
        });
    } catch (error) {
        console.error('Error removing course:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    runMigration,
    getStudentDegreeDetails,
    getMyDegreeDetails,
    syncStudent,
    addCourse,
    removeCourse
};
