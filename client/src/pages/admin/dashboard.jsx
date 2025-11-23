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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageKey, setUploadedImageKey] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [degreeToDelete, setDegreeToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchDegreePrograms();
    fetchNotifications();
    fetchUsers();
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
      console.log('User role:', response.data.role);
      console.log('Is admin?', response.data.role === 'admin');
      
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        'http://localhost:3000/api/upload/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setFormData(prev => ({ ...prev, previewImage: response.data.url }));
      setImagePreview(response.data.url);
      setUploadedImageKey(response.data.key);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedImageKey) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:3000/api/upload/delete', {
          headers: { Authorization: `Bearer ${token}` },
          data: { key: uploadedImageKey }
        });
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    setFormData(prev => ({ ...prev, previewImage: '' }));
    setImagePreview(null);
    setUploadedImageKey(null);
  };

  const handleDeleteDegree = async () => {
    if (confirmText.toLowerCase() !== 'confirm') {
      toast.error('Please type "confirm" to delete');
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/degree-programs/${degreeToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Degree program deleted successfully!');
      setShowDeleteDialog(false);
      setDegreeToDelete(null);
      setConfirmText('');
      fetchDegreePrograms();
    } catch (error) {
      console.error('Error deleting degree:', error);
      toast.error(error.response?.data?.message || 'Failed to delete degree program');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (degree) => {
    setDegreeToDelete(degree);
    setConfirmText('');
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDegreeToDelete(null);
    setConfirmText('');
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
      setImagePreview(null);
      setUploadedImageKey(null);
      
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
      type: "link",
      href: "/adminDashboard/manage-degree",
      title: "Manage Degree",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
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
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header - Full Width */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

      {/* Below Header: Left Aside + Main Content + Right Aside */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Debug: sidebarOpen={String(sidebarOpen)} */}
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          navItems={navItems} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
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
                        <DegreeCard 
                          key={program._id} 
                          degree={program} 
                          userRole="admin"
                          onEnrollmentSuccess={fetchDegreePrograms}
                          onClick={setSelectedDegree}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "add-degree" && (
            <div className="w-full">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
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

                  {/* Preview Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview Image <span className="text-gray-400">(Optional)</span>
                    </label>
                    
                    {!imagePreview ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragActive 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        
                        {uploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-3"></div>
                            <p className="text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gray-600 mb-2">
                              Drag and drop your image here, or{' '}
                              <label htmlFor="imageUpload" className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                                browse
                              </label>
                            </p>
                            <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF (Max 5MB)</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="relative border-2 border-gray-300 rounded-lg p-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                          title="Remove image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
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

          {activeTab === "remove-degree" && (
            <div className="w-full">
              <div className="mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3">
                  Remove Degree Program
                </h2>
                <p className="text-gray-600 text-lg">Select a degree program to remove from the system</p>
              </div>

              {degreePrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-md">
                  <svg className="w-28 h-28 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Degree Programs</h3>
                  <p className="text-gray-500 text-base">There are no degree programs to remove</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Program Title
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              Code
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Lecturers
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                              </svg>
                              Students
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {degreePrograms.map((program, index) => (
                          <tr 
                            key={program._id} 
                            className={`transition-colors duration-150 hover:bg-red-50 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">{program.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{program.description?.substring(0, 60)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {program.code}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-800 text-sm font-semibold">
                                  {program.lecturers?.length || 0}
                                </span>
                                <span className="text-sm text-gray-600">assigned</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                                  {program.students?.length || 0}
                                </span>
                                <span className="text-sm text-gray-600">enrolled</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => openDeleteDialog(program)}
                                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Table Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">
                        Total <span className="font-semibold text-gray-900">{degreePrograms.length}</span> degree program{degreePrograms.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Be careful when removing degree programs</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </main>

        {/* Right Sidebar - Notifications */}
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

              {/* User Statistics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-teal-50 p-3 rounded-lg text-center">
                  <p className="text-xs font-medium text-teal-600">Total</p>
                  <p className="text-xl font-bold text-teal-700">{users.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs font-medium text-green-600">Students</p>
                  <p className="text-xl font-bold text-green-700">{users.filter(u => u.role === 'student').length}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs font-medium text-blue-600">Lecturers</p>
                  <p className="text-xl font-bold text-blue-700">{users.filter(u => u.role === 'lecturer').length}</p>
                </div>
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-2">
                You are about to delete the degree program:
              </p>
              <p className="font-semibold text-gray-900 mb-4">
                {degreeToDelete?.title} ({degreeToDelete?.code})
              </p>
              <p className="text-sm text-red-600 mb-4">
                Warning: This action cannot be undone. All associated data will be permanently deleted.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold">confirm</span> to delete
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                placeholder="Type 'confirm' here"
                disabled={deleting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteDegree}
                disabled={confirmText.toLowerCase() !== 'confirm' || deleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Program'}
              </button>
              <button
                onClick={closeDeleteDialog}
                disabled={deleting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
