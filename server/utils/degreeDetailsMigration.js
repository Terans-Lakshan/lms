const mongoose = require('mongoose');
const DegreeUser = require('../models/degreeUser');
const CourseUser = require('../models/courseUser');
const DegreeDetails = require('../models/degreeDetails');
const User = require('../models/user');

const migrateToDegreeDetails = async () => {
    try {
        console.log('Starting migration to DegreeDetails...');

        // Get all users with role 'student'
        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students`);

        for (const student of students) {
            console.log(`\nProcessing student: ${student.registrationNo} (${student.name})`);

            // Check if DegreeDetails already exists for this student
            let degreeDetails = await DegreeDetails.findOne({ 
                studentRegistrationNumber: student.registrationNo 
            });

            if (degreeDetails) {
                console.log(`  - DegreeDetails already exists, updating...`);
            } else {
                console.log(`  - Creating new DegreeDetails...`);
                degreeDetails = new DegreeDetails({
                    studentRegistrationNumber: student.registrationNo,
                    degrees: []
                });
            }

            // Get student's degree enrollments from DegreeUser
            const degreeUser = await DegreeUser.findOne({ userId: student._id })
                .populate('degrees.degreeId');

            if (degreeUser && degreeUser.degrees && degreeUser.degrees.length > 0) {
                console.log(`  - Found ${degreeUser.degrees.length} degree enrollments`);

                for (const degree of degreeUser.degrees) {
                    if (degree.status === 'active' && degree.degreeId) {
                        console.log(`    - Processing degree: ${degree.degreeId.title}`);

                        // Check if this degree already exists in degreeDetails
                        const existingDegree = degreeDetails.degrees.find(
                            d => d.degreeName === degree.degreeId.title
                        );

                        if (!existingDegree) {
                            // Get student's courses for this degree from CourseUser
                            const courseUser = await CourseUser.findOne({ userId: student._id });
                            let coursesForDegree = [];

                            if (courseUser && courseUser.courses) {
                                // Filter courses that belong to this degree program
                                const degreeProgram = degree.degreeId;
                                if (degreeProgram.courses && degreeProgram.courses.length > 0) {
                                    coursesForDegree = courseUser.courses
                                        .filter(c => c.status === 'active')
                                        .map(c => c.courseId)
                                        .filter(courseId => 
                                            degreeProgram.courses.some(
                                                dc => dc.toString() === courseId.toString()
                                            )
                                        );
                                }
                            }

                            console.log(`      - Adding ${coursesForDegree.length} courses`);

                            degreeDetails.degrees.push({
                                degreeName: degree.degreeId.title,
                                courses: coursesForDegree
                            });
                        } else {
                            console.log(`      - Degree already exists in DegreeDetails, skipping`);
                        }
                    }
                }
            } else {
                console.log(`  - No degree enrollments found`);
            }

            // Save the degreeDetails document
            await degreeDetails.save();
            console.log(`  - Saved DegreeDetails for ${student.registrationNo}`);
        }

        console.log('\nMigration completed successfully!');
        return { success: true, studentsProcessed: students.length };

    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
};

// Function to sync a specific student's data
const syncStudentDegreeDetails = async (studentId) => {
    try {
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            throw new Error('Student not found or invalid role');
        }

        console.log(`Syncing DegreeDetails for student: ${student.registrationNo}`);

        // Find or create DegreeDetails
        let degreeDetails = await DegreeDetails.findOne({ 
            studentRegistrationNumber: student.registrationNo 
        });

        if (!degreeDetails) {
            degreeDetails = new DegreeDetails({
                studentRegistrationNumber: student.registrationNo,
                degrees: []
            });
        }

        // Get student's degree enrollments
        const degreeUser = await DegreeUser.findOne({ userId: student._id })
            .populate('degrees.degreeId');

        if (degreeUser && degreeUser.degrees) {
            // Clear existing degrees and rebuild
            degreeDetails.degrees = [];

            for (const degree of degreeUser.degrees) {
                if (degree.status === 'active' && degree.degreeId) {
                    // Get courses for this degree
                    const courseUser = await CourseUser.findOne({ userId: student._id });
                    let coursesForDegree = [];

                    if (courseUser && courseUser.courses) {
                        const degreeProgram = degree.degreeId;
                        if (degreeProgram.courses && degreeProgram.courses.length > 0) {
                            coursesForDegree = courseUser.courses
                                .filter(c => c.status === 'active')
                                .map(c => c.courseId)
                                .filter(courseId => 
                                    degreeProgram.courses.some(
                                        dc => dc.toString() === courseId.toString()
                                    )
                                );
                        }
                    }

                    degreeDetails.degrees.push({
                        degreeName: degree.degreeId.title,
                        courses: coursesForDegree
                    });
                }
            }
        }

        await degreeDetails.save();
        console.log(`Successfully synced DegreeDetails for ${student.registrationNo}`);
        return degreeDetails;

    } catch (error) {
        console.error('Sync error:', error);
        throw error;
    }
};

// Function to add course to student's degree in DegreeDetails
const addCourseToStudentDegree = async (studentRegistrationNo, degreeName, courseId) => {
    try {
        const degreeDetails = await DegreeDetails.findOne({ 
            studentRegistrationNumber: studentRegistrationNo 
        });

        if (!degreeDetails) {
            throw new Error('DegreeDetails not found for student');
        }

        const degree = degreeDetails.degrees.find(d => d.degreeName === degreeName);
        if (!degree) {
            throw new Error('Degree not found in student records');
        }

        // Check if course already exists
        if (!degree.courses.includes(courseId)) {
            degree.courses.push(courseId);
            await degreeDetails.save();
            console.log(`Added course ${courseId} to ${degreeName} for student ${studentRegistrationNo}`);
        }

        return degreeDetails;
    } catch (error) {
        console.error('Error adding course:', error);
        throw error;
    }
};

// Function to remove course from student's degree in DegreeDetails
const removeCourseFromStudentDegree = async (studentRegistrationNo, degreeName, courseId) => {
    try {
        const degreeDetails = await DegreeDetails.findOne({ 
            studentRegistrationNumber: studentRegistrationNo 
        });

        if (!degreeDetails) {
            throw new Error('DegreeDetails not found for student');
        }

        const degree = degreeDetails.degrees.find(d => d.degreeName === degreeName);
        if (!degree) {
            throw new Error('Degree not found in student records');
        }

        degree.courses = degree.courses.filter(c => c.toString() !== courseId.toString());
        await degreeDetails.save();
        console.log(`Removed course ${courseId} from ${degreeName} for student ${studentRegistrationNo}`);

        return degreeDetails;
    } catch (error) {
        console.error('Error removing course:', error);
        throw error;
    }
};

module.exports = {
    migrateToDegreeDetails,
    syncStudentDegreeDetails,
    addCourseToStudentDegree,
    removeCourseFromStudentDegree
};
