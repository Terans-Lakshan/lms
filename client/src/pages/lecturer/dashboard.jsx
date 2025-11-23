/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DegreeCard from "../../components/degreeCard";

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [degreePrograms, setDegreePrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/notifications/lecturer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      console.log('Lecturer notifications loaded:', response.data.length);
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

  const refreshData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const programsRes = await axios.get('/api/degree-programs');
      setDegreePrograms(programsRes.data);
      setFilteredPrograms(programsRes.data);
      fetchNotifications(); // Also refresh notifications
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Lecturer Dashboard - Token:', token ? 'Present' : 'Missing');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Lecturer Dashboard - User data:', response.data);
        
        // Check if user has lecturer role
        if (response.data.role !== 'lecturer') {
          toast.error(`Access denied. You are logged in as ${response.data.role}. Please log in with a lecturer account.`);
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        setUser(response.data);
        
        // Fetch all degree programs
        const programsRes = await axios.get('/api/degree-programs');
        setDegreePrograms(programsRes.data);
        setFilteredPrograms(programsRes.data);

        // Fetch lecturer's enrolled programs
        const enrolledRes = await axios.get('/api/degree-programs/my-enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnrolledPrograms(enrolledRes.data);

        // Fetch notifications
        fetchNotifications();
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/login');
      }
    };
    
    fetchData();
  }, [navigate]);

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
      href: "/lecturerDashboard/my-courses",
      title: "My Courses",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      type: "link",
      href: "/lecturerDashboard/manage-courses",
      title: "Manage Courses",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
          {!rightSidebarOpen && (
            <button
              onClick={() => setRightSidebarOpen(true)}
              className="fixed right-4 top-24 bg-teal-500 text-white p-2 rounded-lg shadow-lg hover:bg-teal-600 z-10"
              title="Show Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.filter(n => n.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.filter(n => n.status === 'pending').length}
                </span>
              )}
            </button>
          )}
          
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
          
          {selectedDegree ? (
            <div>
              <button
                onClick={() => setSelectedDegree(null)}
                className="mb-4 flex items-center text-teal-600 hover:text-teal-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Programs
              </button>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div 
                  className="h-64 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${selectedDegree.previewImage})`,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-8 w-full">
                      <h1 className="text-4xl font-bold text-white mb-2">{selectedDegree.title}</h1>
                      <p className="text-teal-200 text-lg">Code: {selectedDegree.code}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedDegree.description || 'No description available'}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Lecturers</h3>
                    {selectedDegree.lecturers && selectedDegree.lecturers.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDegree.lecturers.map((lecturer, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-700">{`${lecturer.name?.first || ''} ${lecturer.name?.last || ''}`.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No lecturers assigned yet</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Courses</h3>
                    {selectedDegree.courses && selectedDegree.courses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedDegree.courses.map((course) => (
                          <div key={course._id} className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 transition">
                            <h4 className="font-semibold text-gray-800 mb-1">{course.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{course.code}</p>
                            <p className="text-xs text-gray-500">Credits: {course.credit}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No courses available yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                      userRole="lecturer"
                      onEnrollmentSuccess={refreshData}
                      onClick={setSelectedDegree}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className={`bg-white border-l border-gray-200 p-6 overflow-auto transition-all duration-300 ${
          rightSidebarOpen ? "w-80" : "w-0 p-0 overflow-hidden"
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
                  <p className="text-2xl font-bold text-blue-700">
                    {enrolledPrograms.reduce((total, program) => total + (program.courses?.length || 0), 0)}
                  </p>
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
                  notifications.map((notification) => (
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
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        {notification.degreeProgram?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
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

export default LecturerDashboard;
