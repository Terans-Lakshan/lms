const Course = require('../models/course.js');
const DegreeProgram = require('../models/degreeProgramme.js');

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
    updateCourse,
    getCourse,
    getAllCourses,
    deleteCourse
};
