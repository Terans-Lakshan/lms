// const Course = require('../models/course.js');
// const DegreeProgram = require('../models/degreeProgramme.js');

import { GetObjectCommand } from '@aws-sdk/client-s3';
import Course from '../models/course.js';
import DegreeProgram from '../models/degreeProgramme.js';
import { s3, getBucketName, deleteS3Object } from '../config/s3.js';

// Only an admin, or a lecturer assigned to the degree programme the course belongs
// to, may change or remove its materials. Students can read them but nothing more.
const canManageMaterials = async (user, courseId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'lecturer') return false;

    const degreeProgram = await DegreeProgram.findOne({ courses: courseId }).select('lecturers');
    if (!degreeProgram) return false;

    return degreeProgram.lecturers.some(
        (lecturerId) => lecturerId.toString() === user.id.toString()
    );
};

// Post a written note to the course, for lecturers who want to say something to
// their students rather than attach a file or a link
export const addMaterialMessage = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;

        if (!courseId || !content || !content.trim()) {
            return res.status(400).json({ message: 'Course ID and a message are required' });
        }

        if (!await canManageMaterials(req.user, courseId)) {
            return res.status(403).json({ message: 'You are not allowed to post a message to this course' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const newMaterial = {
            type: 'message',
            filename: (title && title.trim()) || 'Message',
            content: content.trim(),
            uploadedBy: req.user.id,
            createdAt: new Date()
        };

        course.resources.push(newMaterial);
        await course.save();

        res.status(201).json({
            message: 'Message posted successfully',
            material: course.resources[course.resources.length - 1]
        });
    } catch (error) {
        console.error('Error posting course message:', error);
        res.status(500).json({ message: 'Failed to post the message', error: error.message });
    }
};

// Rename a material, or repoint a link at a different address
export const updateMaterial = async (req, res) => {
    try {
        const { courseId, resourceId } = req.params;
        const { filename, url } = req.body;

        if (!await canManageMaterials(req.user, courseId)) {
            return res.status(403).json({ message: 'You are not allowed to change this material' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const material = course.resources.id(resourceId);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const newName = typeof filename === 'string' ? filename.trim() : '';
        if (!newName) {
            return res.status(400).json({ message: 'A name is required' });
        }
        material.filename = newName;

        // A message carries its own text, which is the part worth editing
        if (material.type === 'message' && typeof req.body.content === 'string') {
            if (!req.body.content.trim()) {
                return res.status(400).json({ message: 'A message cannot be empty' });
            }
            material.content = req.body.content.trim();
        }

        // Only a link carries an address that can be edited; a file keeps its S3 object
        if (material.type === 'link' && typeof url === 'string' && url.trim()) {
            try {
                new URL(url.trim());
            } catch {
                return res.status(400).json({ message: 'Invalid URL format' });
            }
            material.url = url.trim();
        }

        await course.save();

        res.status(200).json({ message: 'Material updated successfully', material });
    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ message: 'Failed to update material', error: error.message });
    }
};

// Remove a material from the course, and the stored file along with it
export const deleteMaterial = async (req, res) => {
    try {
        const { courseId, resourceId } = req.params;

        if (!await canManageMaterials(req.user, courseId)) {
            return res.status(403).json({ message: 'You are not allowed to remove this material' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const material = course.resources.id(resourceId);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const { key, type, filename } = material;
        course.resources.pull(resourceId);
        await course.save();

        // The database is the record of what a course offers, so a file left behind in
        // the bucket is logged rather than failing the request the lecturer asked for
        if (type === 'file' && key) {
            try {
                await deleteS3Object(key);
            } catch (error) {
                console.error('Material removed but its file could not be deleted from S3:', key, error.message);
            }
        }

        res.status(200).json({ message: `${filename || 'Material'} removed successfully` });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ message: 'Failed to remove material', error: error.message });
    }
};

// Stream one uploaded course material back to the browser.
// The S3 bucket is private, so the stored object URL answers 403 to anyone opening it
// directly - the file has to be fetched with the server credentials and piped out.
// Going through the course means a caller can only reach files that really belong to
// a course, never an arbitrary key in the bucket, and the download keeps the original
// filename instead of the generated S3 key.
export const downloadMaterial = async (req, res) => {
    try {
        const { courseId, resourceId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const material = course.resources.id(resourceId);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Only files are stored in S3. A link is opened in the browser and a message
        // is read in place, so neither has anything to stream back.
        if (material.type !== 'file' || !material.key) {
            return res.status(400).json({
                message: material.type === 'message'
                    ? 'This material is a message. There is nothing to download.'
                    : 'This material is a link. Open it instead of downloading.',
                url: material.url
            });
        }

        const object = await s3.send(new GetObjectCommand({
            Bucket: getBucketName(),
            Key: material.key
        }));

        const filename = material.filename || 'download';
        // Quotes and control characters would break the header, so the plain
        // parameter is reduced to safe characters; the RFC 5987 form alongside it
        // carries the real name, accents and all
        const asciiName = filename.replace(/[^A-Za-z0-9._ -]/g, '_');

        res.setHeader('Content-Type', material.mimeType || object.ContentType || 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`
        );
        if (object.ContentLength) {
            res.setHeader('Content-Length', object.ContentLength);
        }

        object.Body.on('error', (error) => {
            console.error('Error streaming material from S3:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Failed to download material' });
            } else {
                res.destroy(error);
            }
        });

        object.Body.pipe(res);
    } catch (error) {
        console.error('Error downloading material:', error);

        if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
            return res.status(404).json({ message: 'The stored file no longer exists' });
        }

        res.status(500).json({ message: 'Failed to download material', error: error.message });
    }
};

export const addMaterialLink = async (req, res) => {
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

export const updateCourse = async (req, res) => {
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

export const getCourse = async (req, res) => {
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

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error fetching courses" });
    }
};

export const deleteCourse = async (req, res) => {
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

// module.exports = {
//     addMaterialLink,
//     updateCourse,
//     getCourse,
//     getAllCourses,
//     deleteCourse
// };
export default {
    addMaterialLink,
    addMaterialMessage,
    downloadMaterial,
    updateMaterial,
    deleteMaterial,
    updateCourse,
    getCourse,
    getAllCourses,
    deleteCourse
};
