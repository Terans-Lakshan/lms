import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const LecturerDashboardSidebar = ({ isOpen, onClose, enrolledPrograms = [] }) => {
  const [notifications, setNotifications] = useState([]);
  const [processing, setProcessing] = useState({});

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/notifications/lecturer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleCourseEnrollmentRequest = async (notificationId, action) => {
    setProcessing(prev => ({ ...prev, [notificationId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/enrollments/handle-course-request',
        { notificationId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Enrollment request ${action}ed successfully`);
      fetchNotifications();
    } catch (error) {
      console.error('Error handling enrollment request:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessing(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:3000/api/notifications/lecturer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Calculate total courses from all degree programs the lecturer teaches
  const totalCourses = enrolledPrograms.reduce((total, enrollment) => {
    // enrolledPrograms has structure: { degreeProgram: { courses: [...] } }
    const coursesCount = enrollment.degreeProgram?.courses?.length || 0;
    return total + coursesCount;
  }, 0);

  return (
    <aside className={`bg-white border-l border-gray-200 p-6 overflow-auto transition-all duration-300 ${
      isOpen ? "w-80" : "w-0 p-0 overflow-hidden"
    }`}>
      {isOpen && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
              title="Hide Notifications"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <p className="text-xs font-medium text-teal-700">Degree Programs</p>
              </div>
              <p className="text-2xl font-bold text-teal-700">{enrolledPrograms.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xs font-medium text-blue-700">Total Courses</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalCourses}</p>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isCourseEnrollment = notification.type === 'course_enrollment_request';
                
                return (
                <div 
                  key={notification._id} 
                  className={`p-4 rounded-lg border ${
                    notification.status === 'pending' 
                      ? 'bg-blue-50 border-blue-200' 
                      : notification.status === 'accepted'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      notification.status === 'pending'
                        ? 'bg-blue-100 text-blue-700'
                        : notification.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </span>
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete notification"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {isCourseEnrollment && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 font-medium">Course Enrollment Request</p>
                      <p className="text-sm text-gray-800 font-semibold">
                        {notification.course?.title} ({notification.course?.code})
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Student: {notification.requester?.name?.first} {notification.requester?.name?.last}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reg No: {notification.requester?.registrationNo}
                      </p>
                    </div>
                  )}
                  
                  {!isCourseEnrollment && (
                    <>
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        {notification.degreeProgram?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.message}
                      </p>
                    </>
                  )}
                  
                  {isCourseEnrollment && notification.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleCourseEnrollmentRequest(notification._id, 'accept')}
                        disabled={processing[notification._id]}
                        className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-600 transition disabled:opacity-50"
                      >
                        {processing[notification._id] ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleCourseEnrollmentRequest(notification._id, 'reject')}
                        disabled={processing[notification._id]}
                        className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600 transition disabled:opacity-50"
                      >
                        {processing[notification._id] ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )})
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default LecturerDashboardSidebar;
