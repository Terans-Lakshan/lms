import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import CourseCard from "../../components/courseCard";
import LecturerDashboardSidebar from "../../components/lecturerDashboardSidebar";

const LecturerMyCourses = () => {
  const [activeTab, setActiveTab] = useState("my-courses");
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [courseData, setCourseData] = useState({
    title: "",
    code: "",
    credit: "",
    description: ""
  });

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
        
        // Fetch enrolled programs (degrees lecturer is teaching)
        const programsRes = await axios.get('/api/degree-programs/my-enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('=== LECTURER MY COURSES DEBUG ===');
        console.log('User data:', userRes.data);
        console.log('User role:', userRes.data.role);
        console.log('User ID:', userRes.data._id);
        console.log('Raw API response:', programsRes.data);
        console.log('Response length:', programsRes.data.length);
        
        // Log each enrollment to see the structure
        programsRes.data.forEach((enrollment, index) => {
          console.log(`Enrollment ${index}:`, enrollment);
          console.log(`  - Degree Program:`, enrollment.degreeProgram);
          console.log(`  - Courses:`, enrollment.degreeProgram?.courses);
        });
        
        setEnrolledPrograms(programsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

  const handleAddCourse = (program) => {
    setSelectedProgram(program);
    setShowAddCourseModal(true);
  };

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/degree-programs/add-course',
        {
          ...courseData,
          degreeProgramId: selectedProgram._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Course added successfully!');
      setShowAddCourseModal(false);
      setCourseData({
        title: "",
        code: "",
        credit: "",
        description: ""
      });
      
      // Refresh the data
      const programsRes = await axios.get('/api/degree-programs/my-enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolledPrograms(programsRes.data);
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error(error.response?.data?.error || 'Failed to add course');
    }
  };

  const navItems = [
    {
      type: "link",
      href: "/lecturerDashboard",
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
      href: "/lecturerDashboard/manage-courses",
      title: "Manage Courses",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      type: "link",
      href: "/lecturerDashboard/results",
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
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          navItems={navItems} 
        />

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
            </button>
          )}
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
          
          {enrolledPrograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-600 text-lg font-medium mb-2">No assigned degree programs</p>
              <p className="text-gray-500 text-sm">Request to teach a degree program to see courses here</p>
            </div>
          ) : (
            <div className="space-y-8">
              {enrolledPrograms.map((enrollment) => {
                const program = enrollment.degreeProgram;
                console.log('Processing enrollment:', enrollment);
                console.log('Degree program:', program);
                console.log('Courses in program:', program?.courses);
                
                if (!program) return null;
                
                return (
                  <div key={enrollment._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {program.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Course Code: <span className="font-medium text-gray-800">{program.code}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddCourse(program)}
                        className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Course
                      </button>
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

        <LecturerDashboardSidebar 
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
          enrolledPrograms={enrolledPrograms}
        />
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Add Course to {selectedProgram?.title}
              </h2>
              <button
                onClick={() => {
                  setShowAddCourseModal(false);
                  setCourseData({
                    title: "",
                    code: "",
                    credit: "",
                    description: ""
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleCourseInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={courseData.code}
                  onChange={handleCourseInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., CS101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Hours
                </label>
                <input
                  type="number"
                  name="credit"
                  value={courseData.credit}
                  onChange={handleCourseInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter credit hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleCourseInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter course description"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setCourseData({
                      title: "",
                      code: "",
                      credit: "",
                      description: ""
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerMyCourses;
