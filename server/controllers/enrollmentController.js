// const CourseUser = require('../models/courseUser');
// const Course = require('../models/course');
// const User = require('../models/user');
// const Notification = require('../models/notification');
// const DegreeProgram = require('../models/degreeProgramme');

import mongoose from 'mongoose';
import CourseUser from '../models/courseUser.js';
import Course from '../models/course.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import DegreeProgram from '../models/degreeProgramme.js';

// Request enrollment in a course (creates notification for lecturers)
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find which degree program this course belongs to
    let degreeProgram = await DegreeProgram.findOne({ courses: courseId })
      .populate('lecturers', 'name email');

    // Fall back to the reference stored on the course itself
    if (!degreeProgram && course.degreeProgram) {
      degreeProgram = await DegreeProgram.findById(course.degreeProgram)
        .populate('lecturers', 'name email');
    }

    if (!degreeProgram) {
      return res.status(404).json({ message: 'Degree program for this course not found' });
    }

    // Check if already enrolled
    let courseUser = await CourseUser.findOne({ userId });
    if (courseUser) {
      const alreadyEnrolled = courseUser.courses.some(
        c => c.courseId.toString() === courseId
      );
      if (alreadyEnrolled) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }
    }

    // Check if there's already a pending request for this course
    const existingNotification = await Notification.findOne({
      requester: userId,
      course: courseId,
      type: 'course_enrollment_request',
      status: 'pending'
    });

    if (existingNotification) {
      return res.status(400).json({ message: 'You already have a pending enrollment request for this course' });
    }

    const assignedLecturers = Array.isArray(degreeProgram.lecturers) ? degreeProgram.lecturers : [];
    const lecturerIds = [...new Set(
      assignedLecturers.map(lecturer => (lecturer && lecturer._id ? lecturer._id.toString() : lecturer.toString()))
    )];

    if (!lecturerIds.length) {
      return res.status(400).json({
        message: 'No lecturers are assigned to this degree program yet. Please contact the admin.'
      });
    }

    // One id shared by every copy of this request, so that a response from any of the
    // assigned lecturers can be reflected on the copies held by the others
    const requestGroup = new mongoose.Types.ObjectId();

    const notifications = await Promise.all(
      lecturerIds.map(async (lecturerId) => {
        const notification = new Notification({
          type: 'course_enrollment_request',
          requestGroup,
          requester: userId,
          recipient: lecturerId,
          requesterRole: user.role,
          recipientRole: 'lecturer',
          course: courseId,
          degreeProgram: degreeProgram._id,
          status: 'pending',
          message: `${user.name.first} ${user.name.last} (${user.registrationNo}) has requested to enroll in ${course.title} (${course.code})`
        });

        await notification.save();
        return notification;
      })
    );

    console.log('Course enrollment notifications created:', {
      degreeProgram: degreeProgram._id,
      course: courseId,
      student: userId,
      recipients: lecturerIds,
      count: notifications.length
    });

    // Create a response notification for the student
    const studentNotification = new Notification({
      type: 'course_enrollment_response',
      requestGroup,
      requester: userId,
      requesterRole: user.role,
      course: courseId,
      degreeProgram: degreeProgram._id,
      status: 'pending',
      message: `Your enrollment request for ${course.title} (${course.code}) is pending approval`
    });

    await studentNotification.save();

    res.status(200).json({ 
      message: 'Enrollment request sent successfully. Waiting for lecturer approval.',
      notifications,
      notification: notifications[0]
    });
  } catch (error) {
    console.error('Enrollment request error:', error);
    res.status(500).json({ message: 'Error sending enrollment request', error: error.message });
  }
};

// Unenroll from a course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Find CourseUser document
    const courseUser = await CourseUser.findOne({ userId });

    if (!courseUser) {
      return res.status(404).json({ message: 'No enrollment record found' });
    }

    // Check if enrolled in the course
    const courseIndex = courseUser.courses.findIndex(
      c => c.courseId.toString() === courseId
    );

    if (courseIndex === -1) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }

    // Remove course from enrollment
    courseUser.courses.splice(courseIndex, 1);
    await courseUser.save();

    res.status(200).json({ 
      message: 'Successfully unenrolled from course',
      enrollment: courseUser
    });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ message: 'Error unenrolling from course', error: error.message });
  }
};

// Get user's enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const courseUser = await CourseUser.findOne({ userId })
      .populate('courses.courseId');

    if (!courseUser) {
      return res.status(200).json({ courses: [] });
    }

    res.status(200).json({ 
      courses: courseUser.courses,
      enrollment: courseUser
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
  }
};

// Get enrollment status for a specific course
export const getCourseEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if enrolled
    const courseUser = await CourseUser.findOne({ userId });
    const isEnrolled = courseUser?.courses.some(c => c.courseId.toString() === courseId) || false;

    // Check if there's a pending request
    const pendingRequest = await Notification.findOne({
      requester: userId,
      course: courseId,
      type: 'course_enrollment_request',
      status: 'pending'
    });

    res.status(200).json({
      isEnrolled,
      hasPendingRequest: !!pendingRequest,
      status: isEnrolled ? 'enrolled' : (pendingRequest ? 'pending' : 'not_enrolled')
    });
  } catch (error) {
    console.error('Error fetching enrollment status:', error);
    res.status(500).json({ message: 'Error fetching enrollment status', error: error.message });
  }
};

// Build a readable name for a populated user document
const formatUserName = (user) =>
  user?.name ? `${user.name.first ?? ''} ${user.name.last ?? ''}`.trim() : 'Unknown user';

// Build a readable label for a populated course document
const formatCourseLabel = (course) =>
  course ? `${course.title} (${course.code})` : 'the course';

// Handle course enrollment approval/rejection by lecturer
export const handleCourseEnrollmentRequest = async (req, res) => {
  try {
    const { notificationId, action } = req.body;
    const lecturerId = req.user.id;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const notification = await Notification.findById(notificationId)
      .populate('requester', 'name email registrationNo')
      .populate('course', 'title code')
      .populate('respondedBy', 'name email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only the lecturer this copy of the request was addressed to may respond to it
    if (notification.recipient && notification.recipient.toString() !== lecturerId) {
      return res.status(403).json({ message: 'You are not allowed to respond to this request' });
    }

    const studentName = formatUserName(notification.requester);
    const registrationNo = notification.requester?.registrationNo || 'N/A';
    const courseLabel = formatCourseLabel(notification.course);

    // The same request is sent to every lecturer assigned to the degree program.
    // Copies of one request share a requestGroup; requests created before that field
    // existed are matched by student + course within the batch window instead, so a
    // later re-request for the same course is never mistaken for the same request.
    const batchFilter = notification.requestGroup
      ? { requestGroup: notification.requestGroup, type: 'course_enrollment_request' }
      : {
          type: 'course_enrollment_request',
          requester: notification.requester._id,
          course: notification.course._id,
          createdAt: {
            $gte: new Date(notification.createdAt.getTime() - 60000),
            $lte: new Date(notification.createdAt.getTime() + 60000)
          }
        };

    // Another assigned lecturer may have already responded to this request
    const handledByOther = await Notification.findOne({
      ...batchFilter,
      _id: { $ne: notification._id },
      status: { $ne: 'pending' }
    }).populate('respondedBy', 'name email');

    if (notification.status !== 'pending' || handledByOther) {
      const handled = notification.status !== 'pending' ? notification : handledByOther;
      const responderName = handled.respondedBy?.name
        ? formatUserName(handled.respondedBy)
        : 'another lecturer';

      // Bring this lecturer's copy in line with the decision that was already made
      if (notification.status === 'pending') {
        notification.status = handled.status;
        notification.respondedBy = handled.respondedBy?._id || handled.respondedBy;
        notification.respondedAt = handled.respondedAt;
        notification.message = `${studentName} (${registrationNo}) requested to enroll in ${courseLabel}. Already ${handled.status} by ${responderName}.`;
        await notification.save();
      }

      return res.status(400).json({
        message: `This request was already ${handled.status} by ${responderName}`,
        handledBy: responderName,
        status: handled.status,
        notification
      });
    }

    const status = action === 'accept' ? 'accepted' : 'rejected';
    const statusLabel = action === 'accept' ? 'Accepted' : 'Rejected';
    const respondedAt = new Date();

    const lecturer = await User.findById(lecturerId).select('name email');
    const lecturerName = formatUserName(lecturer);

    // Update the responding lecturer's own copy
    notification.status = status;
    notification.respondedBy = lecturerId;
    notification.respondedAt = respondedAt;
    notification.message = `${studentName} (${registrationNo}) requested to enroll in ${courseLabel}. ${statusLabel} by you.`;
    await notification.save();

    // If accepted, enroll student in course
    if (action === 'accept') {
      let courseUser = await CourseUser.findOne({ userId: notification.requester._id });

      if (!courseUser) {
        courseUser = new CourseUser({
          userId: notification.requester._id,
          userName: studentName,
          userEmail: notification.requester.email,
          userRole: 'student',
          courses: []
        });
      }

      // Add course if not already enrolled
      const alreadyEnrolled = courseUser.courses.some(
        c => c.courseId.toString() === notification.course._id.toString()
      );

      if (!alreadyEnrolled) {
        courseUser.courses.push({
          courseId: notification.course._id,
          courseTitle: notification.course.title,
          courseCode: notification.course.code,
          enrolledAt: respondedAt,
          status: 'active',
          assignedBy: lecturerId
        });
        await courseUser.save();
      }
    }

    // Keep the copies held by the other assigned lecturers in sync, so they can see
    // that this request has already been handled and by whom
    const syncResult = await Notification.updateMany(
      {
        ...batchFilter,
        _id: { $ne: notification._id },
        status: 'pending'
      },
      {
        status,
        respondedBy: lecturerId,
        respondedAt,
        message: `${studentName} (${registrationNo}) requested to enroll in ${courseLabel}. ${statusLabel} by ${lecturerName}.`
      }
    );

    // Update the student's own copy of the request
    const studentFilter = notification.requestGroup
      ? { requestGroup: notification.requestGroup, type: 'course_enrollment_response', status: 'pending' }
      : {
          requester: notification.requester._id,
          course: notification.course._id,
          type: 'course_enrollment_response',
          status: 'pending'
        };

    await Notification.updateMany(
      studentFilter,
      {
        status,
        message: action === 'accept'
          ? `Your enrollment request for ${notification.course.title} has been accepted by ${lecturerName}`
          : `Your enrollment request for ${notification.course.title} has been rejected by ${lecturerName}`,
        respondedBy: lecturerId,
        respondedAt
      }
    );

    res.status(200).json({
      message: `Enrollment request ${action}ed successfully`,
      handledBy: lecturerName,
      otherLecturersUpdated: syncResult?.modifiedCount ?? 0,
      notification
    });
  } catch (error) {
    console.error('Error handling enrollment request:', error);
    res.status(500).json({ message: 'Error handling enrollment request', error: error.message });
  }
};

// module.exports = {
//   enrollInCourse,
//   unenrollFromCourse,
//   getEnrolledCourses,
//   getCourseEnrollmentStatus,
//   handleCourseEnrollmentRequest
// };
export default {
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCourses,
  getCourseEnrollmentStatus,
  handleCourseEnrollmentRequest
};