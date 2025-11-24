import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import ContactInfo from "../../components/contactInfo";

const Results = () => {
  const [activeTab, setActiveTab] = useState("results");
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/users/me");
        setUser(userRes.data);
        
        // Fetch enrolled programs for this student
        if (userRes.data.id) {
          const programsRes = await axios.get(`/api/enrollments/my-programs?studentId=${userRes.data.id}`);
          setEnrolledPrograms(programsRes.data);
        }
      } catch (err) {
        console.log(err);
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
      id: "results",
      type: "button",
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
          
          <div className="space-y-8">
            {enrolledPrograms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-500">No Enrolled Degree</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Credit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          You are not enrolled in any degree programs
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              enrolledPrograms.map((enrollment) => (
                <div key={enrollment._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-teal-600 mb-1">
                      {enrollment.degreeProgram?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Code: {enrollment.degreeProgram?.code}
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Credit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enrollment.degreeProgram?.courses && enrollment.degreeProgram.courses.length > 0 ? (
                          enrollment.degreeProgram.courses.map((course, index) => (
                            <tr key={course._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div>
                                  <p className="font-medium">{course.title}</p>
                                  <p className="text-xs text-gray-500">{course.code}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {course.credit || 0}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                                  -
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                              No courses available in this program
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
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
      <ContactInfo />
    </div>
  );
};

export default Results;
