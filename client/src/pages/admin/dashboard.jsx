/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DegreeCard from "../../components/degreeCard";
import RequestNotification from "../../components/requestNotification";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [degreePrograms, setDegreePrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    previewImage: "",
    adminNotes: ""
  });

  useEffect(() => {
    fetchUser();
    fetchDegreePrograms();
    fetchNotifications();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Admin Dashboard - Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Admin Dashboard - User data received:', response.data);
      
      // Check if user has admin role
      if (response.data.role !== 'admin') {
        toast.error(`Access denied. You are logged in as ${response.data.role}. Please log in with an admin account.`);
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    const filtered = degreePrograms.filter(program =>
      program.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPrograms(filtered);
  }, [searchQuery, degreePrograms]);

  const fetchDegreePrograms = async () => {
    try {
      const response = await axios.get('/api/degree-programs');
      setDegreePrograms(response.data);
      setFilteredPrograms(response.data);
    } catch (error) {
      console.error('Error fetching degree programs:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/notifications/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      console.log('Admin notifications loaded:', response.data.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleEnrollmentRequest = async (notificationId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/notifications/handle-request',
        { notificationId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Request ${action}ed successfully!`);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error handling request:', error);
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.code || !formData.description) {
      toast.error("Please fill in all required fields (Title, Code, Description)");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/degree-programs",
        formData
      );

      toast.success("Degree program created successfully!");
      // Reset form
      setFormData({
        title: "",
        code: "",
        description: "",
        previewImage: "",
        adminNotes: ""
      });
      
      // Refresh degree programs list
      fetchDegreePrograms();
      
      // Go back to dashboard view
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Error creating degree program:", error);
      const message = error.response?.data?.message || "Failed to create degree program";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
      id: "manage-degree",
      title: "Manage Degree",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      children: [
        {
          id: "add-degree",
          title: "Add Degree",
          icon: (
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
          onClick: () => setActiveTab('add-degree')
        },
        {
          id: "remove-degree",
          title: "Remove Degree",
          icon: (
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          ),
          onClick: () => alert('Remove Degree Program functionality')
        }
      ]
    },
    {
      type: "link",
      href: "/adminDashboard/manage-users",
      title: "Manage Users",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zM21 10a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
              {notifications.filter(n => n.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.filter(n => n.status === 'pending').length}
                </span>
              )}
            </button>
          )}

          <div className="w-full">
          {activeTab === "dashboard" && (
            <div className="w-full">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    Degree Programs
                  </h2>
                  <p className="text-gray-600">Manage all degree programs in the system</p>
                </div>
                <div className="flex-1 max-w-md ml-auto">
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
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">{searchQuery ? 'No degree programs found' : 'No Degree Programs Yet'}</h3>
                  <p className="text-gray-500 mb-4">{searchQuery ? 'Try a different search term' : 'Start by adding your first degree program'}</p>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveTab('add-degree')}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition"
                    >
                      Add Degree Program
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map((program) => (
                    <DegreeCard key={program._id} degree={program} userRole="admin" />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "add-degree" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Add New Degree Program
                </h1>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      placeholder="e.g., Master of Science in Geographic Information Systems"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      placeholder="e.g., MSGIS-2024"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      required
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                      placeholder="Enter a detailed description of the degree program..."
                    />
                  </div>

                  {/* Preview Image URL */}
                  <div>
                    <label htmlFor="previewImage" className="block text-sm font-medium text-gray-700 mb-2">
                      Preview Image URL <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      id="previewImage"
                      name="previewImage"
                      value={formData.previewImage}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      id="adminNotes"
                      name="adminNotes"
                      value={formData.adminNotes}
                      onChange={handleFormChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                      placeholder="Internal notes for administrative purposes..."
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creating..." : "Create Degree Program"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      disabled={loading}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </div>
        </main>

        {/* Right Sidebar - Notification Panel */}
        <aside className={`bg-white border-l border-gray-200 p-6 overflow-auto transition-all duration-300 ${
          rightSidebarOpen ? "w-96" : "w-0 p-0 overflow-hidden"
        }`}>
          {rightSidebarOpen && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Enrollment Requests
                  {notifications.filter(n => n.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
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

              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 text-sm">No enrollment requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <RequestNotification
                      key={notification._id}
                      notification={notification}
                      onAccept={(id) => handleEnrollmentRequest(id, 'accept')}
                      onReject={(id) => handleEnrollmentRequest(id, 'reject')}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminDashboard;
