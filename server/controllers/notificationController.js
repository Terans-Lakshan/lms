const Notification = require('../models/notification');
const Enrollment = require('../models/enrollment');
const User = require('../models/user');
const DegreeProgram = require('../models/degreeProgramme');
const DegreeUser = require('../models/degreeUser');

// Get all notifications for admin (enrollment and teach requests)
exports.getAdminNotifications = async (req, res) => {
  try {
    console.log('=== getAdminNotifications called ===');
    console.log('User from token:', req.user);

    const notifications = await Notification.find({
      type: { $in: ['enrollment_request', 'teach_request'] }
    })
      .populate('requester', 'name email registrationNo')
      .populate('degreeProgram', 'title code')
      .sort({ createdAt: -1 });

    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Handle enrollment or teach request (accept/reject)
exports.handleEnrollmentRequest = async (req, res) => {
  try {
    const { notificationId, action } = req.body;
    console.log('=== handleRequest ===');
    console.log('Notification ID:', notificationId);
    console.log('Action:', action);
    console.log('Admin user:', req.user);

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const notification = await Notification.findById(notificationId)
      .populate('requester', 'name email registrationNo')
      .populate('degreeProgram', 'title code');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update the original notification
    notification.status = action === 'accept' ? 'accepted' : 'rejected';
    notification.respondedBy = req.user.id;
    notification.respondedAt = new Date();
    await notification.save();

    // Handle based on request type
    if (notification.type === 'enrollment_request') {
      // If accepted, create enrollment and update DegreeUser
      if (action === 'accept') {
        const enrollment = new Enrollment({
          student: notification.requester._id,
          degreeProgram: notification.degreeProgram._id,
          status: 'active'
        });
        await enrollment.save();
        console.log('Enrollment created:', enrollment);
        
        // Update or create DegreeUser document
        let degreeUser = await DegreeUser.findOne({ userId: notification.requester._id });
        
        if (!degreeUser) {
          // Create new DegreeUser
          degreeUser = new DegreeUser({
            userId: notification.requester._id,
            userName: notification.requester.name,
            userEmail: notification.requester.email,
            userRole: 'student',
            degrees: [{
              degreeId: notification.degreeProgram._id,
              degreeTitle: notification.degreeProgram.title,
              degreeCode: notification.degreeProgram.code,
              acceptedBy: req.user.id,
              status: 'active'
            }]
          });
        } else {
          // Add degree to existing DegreeUser if not already present
          const degreeExists = degreeUser.degrees.some(
            deg => deg.degreeId.toString() === notification.degreeProgram._id.toString()
          );
          
          if (!degreeExists) {
            degreeUser.degrees.push({
              degreeId: notification.degreeProgram._id,
              degreeTitle: notification.degreeProgram.title,
              degreeCode: notification.degreeProgram.code,
              acceptedBy: req.user.id,
              status: 'active'
            });
          }
        }
        
        await degreeUser.save();
        console.log('DegreeUser updated:', degreeUser);
        
        // Update notification message
        notification.message = `Your enrollment request for ${notification.degreeProgram.title} has been accepted!`;
      } else {
        // Update notification message for rejection
        notification.message = `Your enrollment request for ${notification.degreeProgram.title} has been rejected.`;
      }

    } else if (notification.type === 'teach_request') {
      // If accepted, add lecturer to degree program and update DegreeUser
      if (action === 'accept') {
        const degreeProgram = await DegreeProgram.findById(notification.degreeProgram._id);
        if (degreeProgram && !degreeProgram.lecturers.includes(notification.requester._id)) {
          degreeProgram.lecturers.push(notification.requester._id);
          await degreeProgram.save();
          console.log('Lecturer added to degree program:', degreeProgram);
        }
        
        // Update or create DegreeUser document for lecturer
        let degreeUser = await DegreeUser.findOne({ userId: notification.requester._id });
        
        if (!degreeUser) {
          // Create new DegreeUser for lecturer
          degreeUser = new DegreeUser({
            userId: notification.requester._id,
            userName: notification.requester.name,
            userEmail: notification.requester.email,
            userRole: 'lecturer',
            degrees: [{
              degreeId: notification.degreeProgram._id,
              degreeTitle: notification.degreeProgram.title,
              degreeCode: notification.degreeProgram.code,
              acceptedBy: req.user.id,
              status: 'active'
            }]
          });
        } else {
          // Add degree to existing DegreeUser if not already present
          const degreeExists = degreeUser.degrees.some(
            deg => deg.degreeId.toString() === notification.degreeProgram._id.toString()
          );
          
          if (!degreeExists) {
            degreeUser.degrees.push({
              degreeId: notification.degreeProgram._id,
              degreeTitle: notification.degreeProgram.title,
              degreeCode: notification.degreeProgram.code,
              acceptedBy: req.user.id,
              status: 'active'
            });
          }
        }
        
        await degreeUser.save();
        console.log('DegreeUser updated for lecturer:', degreeUser);
        
        // Update notification message
        notification.message = `Your teach request for ${notification.degreeProgram.title} has been accepted!`;
      } else {
        // Update notification message for rejection
        notification.message = `Your teach request for ${notification.degreeProgram.title} has been rejected.`;
      }
    }

    res.json({ 
      message: `Request ${action}ed successfully`,
      notification 
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

// Create enrollment request (student)
exports.createEnrollmentRequest = async (req, res) => {
  try {
    const { degreeProgramId } = req.body;
    const studentId = req.user.id;

    console.log('=== createEnrollmentRequest ===');
    console.log('Student ID:', studentId);
    console.log('Degree Program ID:', degreeProgramId);

    // Check if request already exists
    const existingRequest = await Notification.findOne({
      requester: studentId,
      degreeProgram: degreeProgramId,
      type: 'enrollment_request',
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending enrollment request for this program' 
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      degreeProgram: degreeProgramId,
      status: 'active'
    });

    if (existingEnrollment) {
      return res.status(400).json({ 
        message: 'You are already enrolled in this program' 
      });
    }

    // Create single notification (visible to both admin and student)
    const notification = new Notification({
      type: 'enrollment_request',
      requester: studentId,
      requesterRole: 'student',
      degreeProgram: degreeProgramId,
      status: 'pending',
      message: 'Your enrollment request is pending admin approval.'
    });
    await notification.save();

    console.log('Enrollment request created:', notification._id);

    res.status(201).json({
      message: 'Enrollment request sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating enrollment request:', error);
    res.status(500).json({ message: 'Failed to send enrollment request' });
  }
};

// Create teach request (lecturer)
exports.createTeachRequest = async (req, res) => {
  try {
    const { degreeProgramId } = req.body;
    const lecturerId = req.user.id;

    console.log('=== createTeachRequest ===');
    console.log('Lecturer ID:', lecturerId);
    console.log('Degree Program ID:', degreeProgramId);

    // Check if request already exists
    const existingRequest = await Notification.findOne({
      requester: lecturerId,
      degreeProgram: degreeProgramId,
      type: 'teach_request',
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending teach request for this program' 
      });
    }

    // Check if already teaching
    const degreeProgram = await DegreeProgram.findById(degreeProgramId);
    if (degreeProgram && degreeProgram.lecturers.includes(lecturerId)) {
      return res.status(400).json({ 
        message: 'You are already teaching this program' 
      });
    }

    // Create single notification (visible to both admin and lecturer)
    const notification = new Notification({
      type: 'teach_request',
      requester: lecturerId,
      requesterRole: 'lecturer',
      degreeProgram: degreeProgramId,
      status: 'pending',
      message: 'Your teach request is pending admin approval.'
    });
    await notification.save();

    console.log('Teach request created:', notification._id);

    res.status(201).json({
      message: 'Teach request sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating teach request:', error);
    res.status(500).json({ message: 'Failed to send teach request' });
  }
};

// Get student notifications
exports.getStudentNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    console.log('=== getStudentNotifications ===');
    console.log('Student ID:', studentId);

    const notifications = await Notification.find({
      requester: studentId,
      requesterRole: 'student'
    })
      .populate('degreeProgram', 'title code')
      .populate('course', 'title code')
      .sort({ createdAt: -1 });

    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Get lecturer notifications
exports.getLecturerNotifications = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    console.log('=== getLecturerNotifications ===');
    console.log('Lecturer ID:', lecturerId);

    // Get lecturer's own notifications (teach requests)
    const ownNotifications = await Notification.find({
      requester: lecturerId,
      requesterRole: 'lecturer'
    })
      .populate('degreeProgram', 'title code')
      .populate('course', 'title code')
      .sort({ createdAt: -1 });

    // Get course enrollment requests for courses in degree programs the lecturer teaches
    const DegreeUser = require('../models/degreeUser');
    const degreeUser = await DegreeUser.findOne({ userId: lecturerId });
    
    let courseEnrollmentRequests = [];
    if (degreeUser && degreeUser.degrees.length > 0) {
      const degreeProgramIds = degreeUser.degrees.map(d => d.degreeId);
      
      courseEnrollmentRequests = await Notification.find({
        type: 'course_enrollment_request',
        degreeProgram: { $in: degreeProgramIds },
        status: 'pending'
      })
        .populate('requester', 'name email registrationNo')
        .populate('course', 'title code')
        .populate('degreeProgram', 'title code')
        .sort({ createdAt: -1 });
    }

    // Combine both notification types
    const allNotifications = [...ownNotifications, ...courseEnrollmentRequests];
    
    // Sort by creation date
    allNotifications.sort((a, b) => b.createdAt - a.createdAt);

    console.log('Found notifications:', allNotifications.length);
    res.json(allNotifications);
  } catch (error) {
    console.error('Error fetching lecturer notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};
