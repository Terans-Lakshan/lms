/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DegreeCard from "../../components/degreeCard";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [degreePrograms, setDegreePrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Student Dashboard - Token:', token ? 'Present' : 'Missing');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }
        
        try {
          const userRes = await axios.get("/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Student Dashboard - User data received:', userRes.data);
          
          // Check if profile data is null (invalid/expired token)
          if (!userRes.data) {
            console.log('Invalid token, redirecting to login');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          
          // Check if user has student role
          console.log('User role check:', userRes.data.role);
          if (userRes.data.role !== 'student') {
            toast.error(`Access denied. You are logged in as ${userRes.data.role}. Please log in with a student account.`);
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          
          // Profile endpoint returns JWT payload directly (not wrapped in user object)
          const userData = {
            id: userRes.data.id,
            name: userRes.data.name,
            email: userRes.data.email,
            role: userRes.data.role,
            registrationNo: userRes.data.registrationNo
          };
          setUser(userData);
          
          // Fetch enrolled programs for this student
          if (userRes.data.id) {
            const programsRes = await axios.get('/api/degree-programs/my-enrollments', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolledPrograms(programsRes.data);
            console.log('Enrolled programs loaded:', programsRes.data.length);
          }
          
          // Fetch notifications for this student
          const notificationsRes = await axios.get('http://localhost:3000/api/notifications/student', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(notificationsRes.data);
          console.log('Notifications loaded:', notificationsRes.data.length);
        } catch (userErr) {
          console.log('User not logged in or profile fetch failed');
        }
        
        // Fetch all degree programs (this should work without authentication)
        console.log('Fetching degree programs...');
        const allProgramsRes = await axios.get('/api/degree-programs');
        console.log('Degree programs received:', allProgramsRes.data);
        setDegreePrograms(allProgramsRes.data);
        setFilteredPrograms(allProgramsRes.data);
        
      } catch (err) {
        console.error('Error fetching degree programs:', err);
      }
    };
    
    fetchData();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/notifications/student', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      console.log('Student notifications loaded:', response.data.length);
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
      fetchNotifications(); // Refresh to show updated list
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const refreshEnrolledPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/degree-programs/my-enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolledPrograms(response.data);
      fetchNotifications(); // Also refresh notifications
    } catch (error) {
      console.error('Error refreshing enrolled programs:', error);
    }
  };

  useEffect(() => {
    const filtered = degreePrograms.filter(program =>
      program.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPrograms(filtered);
  }, [searchQuery, degreePrograms]);

  const navItems = [
    {
      id: "dashboard",
      type: "button",
      title: "Dashboard",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      type: "link",
      href: "/studentDashboard/my-courses",
      title: "My Courses",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      type: "link",
      href: "/studentDashboard/results",
      title: "Results",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
          {/* Toggle button for right sidebar when hidden */}
          {!rightSidebarOpen && (
            <button
              onClick={() => setRightSidebarOpen(true)}
              className="fixed right-4 top-24 bg-teal-500 text-white p-2 rounded-lg shadow-lg hover:bg-teal-600 z-10"
              title="Show Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          )}

          {activeTab === "dashboard" && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Available Degree Programs</h2>
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search degree programs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {filteredPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-600 text-lg font-medium mb-2">{searchQuery ? 'No degree programs found' : 'No degree programs available'}</p>
                  <p className="text-gray-500 text-sm">{searchQuery ? 'Try a different search term' : 'Please contact the administrator'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map((program) => (
                    <DegreeCard 
                      key={program._id} 
                      degree={program} 
                      userRole="student"
                      onEnrollmentSuccess={refreshEnrolledPrograms}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "my-courses" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Enrolled Courses</h2>
                <p className="text-gray-600 mt-1">View all degree programs you're enrolled in</p>
              </div>
              
              {enrolledPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-600 text-lg font-medium mb-2">No Enrolled Courses Yet</p>
                  <p className="text-gray-500 text-sm">Start by enrolling in a degree program from the Dashboard</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledPrograms.map((enrollment) => (
                    <DegreeCard 
                      key={enrollment._id} 
                      degree={enrollment.degreeProgram} 
                      userRole="student"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar - Student Notification Panel */}
        <aside className={`bg-white border-l border-gray-200 p-6 overflow-auto transition-all duration-300 ${
          rightSidebarOpen ? "w-96" : "w-0 p-0 overflow-hidden"
        }`}>
          {rightSidebarOpen && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
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

              {/* Student Notifications */}
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-500 text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const isPending = notification.type === 'enrollment_request' && notification.status === 'pending';
                    const isAccepted = notification.status === 'accepted';
                    const isRejected = notification.status === 'rejected';
                    
                    return (
                      <div
                        key={notification._id}
                        className={`p-4 rounded-lg border-2 ${
                          notification.isRead 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-white border-emerald-200'
                        } transition-all hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            isPending 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : isAccepted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isPending ? 'Pending Request' : isAccepted ? 'Accepted' : 'Rejected'}
                          </span>
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                        
                        <p className="text-gray-800 font-medium mb-1">
                          {notification.degreeProgram?.title || 'Degree Program'}
                        </p>
                        
                        <p className="text-gray-600 text-sm mb-2">
                          {isPending 
                            ? 'Your enrollment request is pending admin approval.' 
                            : notification.message}
                        </p>
                        
                        <p className="text-gray-400 text-xs">
                          {new Date(notification.respondedAt || notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.respondedAt || notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;
