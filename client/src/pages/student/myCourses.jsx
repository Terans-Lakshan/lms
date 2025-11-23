/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DegreeCard from "../../components/degreeCard";
import CourseCard from "../../components/courseCard";
import degreeCardBg from "../../assets/degreecardbg.jpg";

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState("my-courses");
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [courseStatuses, setCourseStatuses] = useState({});

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/notifications/student', {
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

  const handleActionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          return;
        }

        const userRes = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);
        
        // Fetch enrolled programs
        const programsRes = await axios.get('/api/degree-programs/my-enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEnrolledPrograms(programsRes.data);
        
        // Extract all courses from enrolled programs
        const allCourses = [];
        programsRes.data.forEach(enrollment => {
          const program = enrollment.degreeProgram;
          if (program && program.courses) {
            program.courses.forEach(course => {
              allCourses.push({
                ...course,
                programName: program.title,
                programCode: program.code
              });
            });
          }
        });
        setEnrolledCourses(allCourses);

        // Fetch user's enrolled courses
        const enrollmentsRes = await axios.get('/api/enrollments/my-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const courseIds = enrollmentsRes.data.courses?.map(c => c.courseId._id || c.courseId) || [];
        setEnrolledCourseIds(courseIds);

        // Fetch enrollment status for all courses
        const allCourseIds = [];
        programsRes.data.forEach(enrollment => {
          const program = enrollment.degreeProgram;
          if (program && program.courses) {
            program.courses.forEach(course => {
              allCourseIds.push(course._id);
            });
          }
        });

        // Fetch status for each course
        const statuses = {};
        await Promise.all(
          allCourseIds.map(async (courseId) => {
            try {
              const statusRes = await axios.get(`/api/enrollments/course-status/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              statuses[courseId] = statusRes.data.status;
            } catch (err) {
              console.error('Error fetching status for course:', courseId, err);
              statuses[courseId] = 'not_enrolled';
            }
          })
        );
        setCourseStatuses(statuses);

        // Fetch notifications
        fetchNotifications();
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, [refreshTrigger]);

  const navItems = [
    {
      id: "dashboard",
      type: "link",
      href: "/studentDashboard",
      title: "Dashboard",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: "my-courses",
      type: "button",
      title: "My Courses",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header - Full Width */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

      {/* Below Header: Left Aside + Main Content + Right Aside */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          navItems={navItems} 
        />







            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8 relative">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
              
              {enrolledPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-600 text-lg font-medium mb-2">No enrolled degree programs</p>
                  <p className="text-gray-500 text-sm">Enroll in a degree program to see your courses here</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {enrolledPrograms.map((enrollment) => {
                    const program = enrollment.degreeProgram;
                    if (!program) return null;
                    
                    return (
                      <div key={enrollment._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
                        {/* Header Section with Gradient Background */}
                        <div 
                          className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 px-8 py-6 border-b-2 border-teal-200 bg-cover bg-center relative"
                        >
                          <div 
                            className="absolute inset-0 bg-cover bg-center opacity-30"
                            style={{
                              backgroundImage: `url(${degreeCardBg})`
                            }}
                          ></div>
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                {program.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="text-gray-600 text-sm font-medium">Program Code:</span>
                                <span className="px-3 py-1 bg-white text-teal-700 rounded-full text-sm font-bold border border-teal-200">
                                  {program.code}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl px-6 py-4 text-center border-2 border-teal-200 shadow-sm">
                              <p className="text-gray-600 text-xs font-medium mb-1">Total Courses</p>
                              <p className="text-4xl font-bold text-teal-600">
                                {program.courses?.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Courses Section */}
                        <div className="p-8 bg-gradient-to-b from-gray-50 to-white">
                          {program.courses && program.courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {program.courses.map((course) => (
                                <CourseCard 
                                  key={course._id} 
                                  course={course} 
                                  userRole="student" 
                                  onActionSuccess={handleActionSuccess}
                                  isEnrolled={enrolledCourseIds.includes(course._id)}
                                  enrollmentStatus={courseStatuses[course._id] || 'not_enrolled'}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <p className="text-gray-600 font-semibold text-lg mb-1">No courses available yet</p>
                              <p className="text-gray-500 text-sm">Courses will appear here once they are added to this program</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>

        {/* Right Sidebar */}
        <aside className={`bg-white border-l border-gray-200 p-6 overflow-auto transition-all duration-300 ${
          rightSidebarOpen ? "w-96" : "w-0 p-0 overflow-hidden"
        }`}>
          {rightSidebarOpen && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                  {notifications.filter(n => n.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => n.status === 'pending').length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setRightSidebarOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Hide Notifications"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-lg border-l-4 ${
                        notification.status === 'pending'
                          ? 'bg-blue-50 border-blue-500'
                          : notification.status === 'accepted'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {notification.status === 'pending' && (
                            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {notification.status === 'accepted' && (
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {notification.status === 'rejected' && (
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className={`text-xs font-semibold uppercase ${
                            notification.status === 'pending'
                              ? 'text-blue-700'
                              : notification.status === 'accepted'
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}>
                            {notification.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {notification.degreeProgram?.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.status !== 'pending' && notification.respondedAt && (
                        <p className="text-xs text-gray-500 italic">
                          Responded on {new Date(notification.respondedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MyCourses;
