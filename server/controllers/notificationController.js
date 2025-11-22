const Notification = require('../models/notification');
const Enrollment = require('../models/enrollment');
const User = require('../models/user');
const DegreeProgram = require('../models/degreeProgramme');

exports.getAdminNotifications = async (req, res) => {
  try {
    console.log('=== GET ADMIN NOTIFICATIONS ===');
    console.log('User from token:', req.user);
    
    const notifications = await Notification.find({ status: 'pending' })
      .populate('student', 'name registrationNo email')
      .populate('degreeProgram', 'title code')
      .sort({ createdAt: -1 });

    console.log('Found notifications:', notifications.length);
    console.log('Notifications:', JSON.stringify(notifications, null, 2));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.handleEnrollmentRequest = async (req, res) => {
  try {
    console.log('=== HANDLE ENROLLMENT REQUEST ===');
    console.log('Request body:', req.body);
    const { notificationId, action } = req.body; // action: 'accept' or 'reject'

    const notification = await Notification.findById(notificationId)
      .populate('student', 'name registrationNo email')
      .populate('degreeProgram', 'title code');

    console.log('Notification found:', notification);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log('Current notification status:', notification.status);
    if (notification.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update notification status
    notification.status = action === 'accept' ? 'accepted' : 'rejected';
    notification.respondedAt = new Date();
    notification.respondedBy = req.user.id;
    notification.isRead = true;
    await notification.save();
    console.log('Notification updated to:', notification.status);

    if (action === 'accept') {
      console.log('Processing ACCEPT action...');
      // Create or update enrollment
      let enrollment = await Enrollment.findOne({
        student: notification.student._id,
        degreeProgram: notification.degreeProgram._id
      });

      console.log('Existing enrollment:', enrollment);

      if (enrollment) {
        enrollment.status = 'active';
        await enrollment.save();
        console.log('Enrollment updated to active');
      } else {
        enrollment = new Enrollment({
          student: notification.student._id,
          degreeProgram: notification.degreeProgram._id,
          status: 'active'
        });
        await enrollment.save();
        console.log('New enrollment created:', enrollment);
      }

      // Create acceptance notification for student
      const studentNotification = new Notification({
        type: 'enrollment_response',
        student: notification.student._id,
        degreeProgram: notification.degreeProgram._id,
        status: 'accepted',
        message: `Your enrollment request for ${notification.degreeProgram.title} has been accepted.`,
        isRead: false
      });
      await studentNotification.save();
      console.log('Student notification created:', studentNotification);

      res.json({ 
        message: 'Enrollment request accepted',
        enrollment,
        notification
      });
    } else {
      console.log('Processing REJECT action...');
      // Create rejection notification for student
      const studentNotification = new Notification({
        type: 'enrollment_response',
        student: notification.student._id,
        degreeProgram: notification.degreeProgram._id,
        status: 'rejected',
        message: `Your enrollment request for ${notification.degreeProgram.title} has been rejected.`,
        isRead: false
      });
      await studentNotification.save();
      console.log('Student rejection notification created:', studentNotification);

      res.json({ 
        message: 'Enrollment request rejected',
        notification
      });
    }
  } catch (error) {
    console.error('Error handling enrollment request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEnrollmentRequest = async (req, res) => {
  try {
    console.log('=== CREATE ENROLLMENT REQUEST ===');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const { degreeProgramId } = req.body;
    const studentId = req.user.id;

    console.log('Student ID:', studentId);
    console.log('Degree Program ID:', degreeProgramId);

    // Check if already enrolled or has pending request
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      degreeProgram: degreeProgramId
    });

    if (existingEnrollment) {
      console.log('Already enrolled');
      return res.status(400).json({ message: 'Already enrolled in this program' });
    }

    const existingNotification = await Notification.findOne({
      student: studentId,
      degreeProgram: degreeProgramId,
      status: 'pending'
    });

    if (existingNotification) {
      console.log('Pending request already exists');
      return res.status(400).json({ message: 'Enrollment request already pending' });
    }

    // Create notification
    const notification = new Notification({
      type: 'enrollment_request',
      student: studentId,
      degreeProgram: degreeProgramId,
      status: 'pending'
    });

    await notification.save();
    console.log('Notification created:', notification._id);

    const populatedNotification = await Notification.findById(notification._id)
      .populate('student', 'name registrationNo email')
      .populate('degreeProgram', 'title code');

    console.log('Populated notification:', populatedNotification);

    res.status(201).json({ 
      message: 'Enrollment request submitted successfully',
      notification: populatedNotification
    });
  } catch (error) {
    console.error('Error creating enrollment request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student notifications (enrollment requests and responses)
exports.getStudentNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const notifications = await Notification.find({ 
      student: studentId,
      $or: [
        { type: 'enrollment_response' },
        { type: 'enrollment_request' }
      ]
    })
      .populate('degreeProgram', 'title code')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
