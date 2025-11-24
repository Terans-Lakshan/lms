const CourseUser = require('../models/courseUser');
const Course = require('../models/course');
const User = require('../models/user');
const Notification = require('../models/notification');
const DegreeProgram = require('../models/degreeProgramme');

// Request enrollment in a course (creates notification for lecturers)
const enrollInCourse = async (req, res) => {
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
    const degreeProgram = await DegreeProgram.findOne({ courses: courseId })
      .populate('lecturers', 'name email');

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

    // Create notification for lecturers teaching this degree program
    const notification = new Notification({
      type: 'course_enrollment_request',
      requester: userId,
      requesterRole: user.role,
      course: courseId,
      degreeProgram: degreeProgram._id,
      status: 'pending',
      message: `${user.name.first} ${user.name.last} (${user.registrationNo}) has requested to enroll in ${course.title} (${course.code})`
    });

    await notification.save();
    console.log('Course enrollment notification created:', {
      type: notification.type,
      degreeProgram: degreeProgram._id,
      course: courseId,
      student: userId
    });

    // Create a response notification for the student
    const studentNotification = new Notification({
      type: 'course_enrollment_response',
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
      notification
    });
  } catch (error) {
    console.error('Enrollment request error:', error);
    res.status(500).json({ message: 'Error sending enrollment request', error: error.message });
  }
};

// Unenroll from a course
const unenrollFromCourse = async (req, res) => {
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
const getEnrolledCourses = async (req, res) => {
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
const getCourseEnrollmentStatus = async (req, res) => {
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

// Handle course enrollment approval/rejection by lecturer
const handleCourseEnrollmentRequest = async (req, res) => {
  try {
    const { notificationId, action } = req.body;
    const lecturerId = req.user.id;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const notification = await Notification.findById(notificationId)
      .populate('requester', 'name email registrationNo')
      .populate('course', 'title code');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update notification status
    notification.status = action === 'accept' ? 'accepted' : 'rejected';
    notification.respondedBy = lecturerId;
    notification.respondedAt = new Date();
    await notification.save();

    // If accepted, enroll student in course
    if (action === 'accept') {
      let courseUser = await CourseUser.findOne({ userId: notification.requester._id });

      if (!courseUser) {
        courseUser = new CourseUser({
          userId: notification.requester._id,
          userName: `${notification.requester.name.first} ${notification.requester.name.last}`,
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
          enrolledAt: new Date(),
          status: 'active',
          assignedBy: lecturerId
        });
        await courseUser.save();
      }
    }

    // Update student's notification
    await Notification.updateMany(
      {
        requester: notification.requester._id,
        course: notification.course._id,
        type: 'course_enrollment_response',
        status: 'pending'
      },
      {
        status: action === 'accept' ? 'accepted' : 'rejected',
        message: action === 'accept' 
          ? `Your enrollment request for ${notification.course.title} has been accepted`
          : `Your enrollment request for ${notification.course.title} has been rejected`,
        respondedBy: lecturerId,
        respondedAt: new Date()
      }
    );

    res.status(200).json({
      message: `Enrollment request ${action}ed successfully`,
      notification
    });
  } catch (error) {
    console.error('Error handling enrollment request:', error);
    res.status(500).json({ message: 'Error handling enrollment request', error: error.message });
  }
};

module.exports = {
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCourses,
  getCourseEnrollmentStatus,
  handleCourseEnrollmentRequest
};
