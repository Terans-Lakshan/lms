/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DegreeCard from "../../components/degreeCard";
import CourseCard from "../../components/courseCard";

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState("my-courses");
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

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
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

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
                      <div key={enrollment._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {program.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Course Code: <span className="font-medium text-gray-800">{program.code}</span>
                          </p>
                        </div>
                        
                        {program.courses && program.courses.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {program.courses.map((course) => (
                              <CourseCard key={course._id} course={course} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No courses available in this program yet</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MyCourses;
