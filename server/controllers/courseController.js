const Course = require('../models/course.js');
const DegreeProgram = require('../models/degreeProgramme.js');

const addMaterialLink = async (req, res) => {
    try {
        const { courseId, link, degreeCode, courseCode } = req.body;

        if (!courseId || !link) {
            return res.status(400).json({ error: "Course ID and link are required" });
        }

        // Validate URL format
        try {
            new URL(link);
        } catch (error) {
            return res.status(400).json({ error: "Invalid URL format" });
        }

        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Add the link to resources
        const newMaterial = {
            type: 'link',
            url: link,
            filename: link, // Use the URL as filename for links
            uploadedBy: req.user.id,
            createdAt: new Date()
        };

        course.resources.push(newMaterial);
        await course.save();

        res.status(200).json({ 
            message: "Link added successfully", 
            material: newMaterial 
        });
    } catch (error) {
        console.error('Error adding material link:', error);
        res.status(500).json({ error: "Server error adding material link" });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, code, credit, description } = req.body;

        // Check if course exists
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Check if another course with the same code exists
        if (code !== course.code) {
            const existingCourse = await Course.findOne({ code, _id: { $ne: id } });
            if (existingCourse) {
                return res.status(400).json({ error: "A course with this code already exists" });
            }
        }

        // Update course
        course.title = title;
        course.code = code;
        course.credit = credit;
        course.description = description;
        
        await course.save();

        res.status(200).json({ 
            message: "Course updated successfully", 
            course 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error updating course" });
    }
};

const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.status(200).json(course);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error fetching course" });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error fetching courses" });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if course exists
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Remove course from all degree programs that have it
        await DegreeProgram.updateMany(
            { courses: id },
            { $pull: { courses: id } }
        );

        // Delete the course
        await Course.findByIdAndDelete(id);

        res.status(200).json({ 
            message: "Course deleted successfully",
            courseId: id
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error deleting course" });
    }
};

module.exports = {
    addMaterialLink,
    updateCourse,
    getCourse,
    getAllCourses,
    deleteCourse
};
