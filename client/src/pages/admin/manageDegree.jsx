import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import RequestNotification from "../../components/requestNotification";

const ManageDegree = () => {
  const [activeTab, setActiveTab] = useState("manage-degree");
  const [subTab, setSubTab] = useState("add-degree");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Add degree form state
  const [degreeData, setDegreeData] = useState({
    title: "",
    code: "",
    description: "",
    previewImage: "",
    adminNotes: ""
  });

  // Degree programs list
  const [degreePrograms, setDegreePrograms] = useState([]);

  // Edit degree form state
  const [editingDegree, setEditingDegree] = useState(null);
  const [editDegreeData, setEditDegreeData] = useState({
    title: "",
    code: "",
    description: "",
    previewImage: "",
    adminNotes: ""
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [userRes, usersRes, notificationsRes, degreesRes] = await Promise.all([
        axios.get("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/auth/users", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/notifications/admin", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/degree-programs", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setUser(userRes.data);
      setUsers(usersRes.data);
      setNotifications(notificationsRes.data);
      setDegreePrograms(degreesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDegreeData(prev => ({
      ...prev,
      [name]: value
    }));
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

    // Check if degree code is provided
    if (!degreeData.code) {
      toast.error('Please enter degree code first');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      formData.append('degreeCode', degreeData.code);

      const response = await axios.post(
        'http://localhost:3000/api/upload/upload-degree-preview',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setDegreeData(prev => ({ ...prev, previewImage: response.data.url }));
      setImagePreview(response.data.url);
      toast.success('Image uploaded successfully! Degree and courses folders created.');
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

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleAddDegree = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/degree-programs', degreeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Degree program added successfully!');
      setDegreeData({
        title: "",
        code: "",
        description: "",
        previewImage: "",
        adminNotes: ""
      });
      setImagePreview(null);
      
      await fetchData();
    } catch (error) {
      console.error('Error adding degree:', error);
      toast.error(error.response?.data?.error || 'Failed to add degree program');
    }
  };

  const handleDeleteDegree = async (degreeId) => {
    if (!window.confirm('Are you sure you want to delete this degree program? This will also remove all related enrollments.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/degree-programs/${degreeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Degree program deleted successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error deleting degree:', error);
      toast.error(error.response?.data?.error || 'Failed to delete degree program');
    }
  };

  const handleEditDegree = (degree) => {
    setEditingDegree(degree._id);
    setEditDegreeData({
      title: degree.title,
      code: degree.code,
      description: degree.description,
      previewImage: degree.previewImage || "",
      adminNotes: degree.adminNotes || ""
    });
    setSubTab("edit-degree");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditDegreeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateDegree = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/degree-programs/${editingDegree}`, editDegreeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Degree program updated successfully!');
      setEditingDegree(null);
      setEditDegreeData({
        title: "",
        code: "",
        description: "",
        previewImage: "",
        adminNotes: ""
      });
      setSubTab("add-degree");
      
      await fetchData();
    } catch (error) {
      console.error('Error updating degree:', error);
      toast.error(error.response?.data?.error || 'Failed to update degree program');
    }
  };

  const handleEnrollmentRequest = async (notificationId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/notifications/handle-request', 
        { notificationId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Request ${action}ed successfully`);
      await fetchData();
    } catch (error) {
      console.error('Error handling request:', error);
      toast.error('Failed to process request');
    }
  };

  const navItems = [
    {
      type: "link",
      href: "/adminDashboard",
      title: "Dashboard",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: "manage-degree",
      type: "button",
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
              {notifications.filter(n => n.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.filter(n => n.status === 'pending').length}
                </span>
              )}
            </button>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Degree Programs</h2>

          {/* Sub Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setSubTab("add-degree")}
              className={`px-4 py-2 font-medium transition-colors ${
                subTab === "add-degree"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Add Degree
            </button>
            <button
              onClick={() => setSubTab("edit-degree")}
              className={`px-4 py-2 font-medium transition-colors ${
                subTab === "edit-degree"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Edit Degree
            </button>
            <button
              onClick={() => setSubTab("remove-degree")}
              className={`px-4 py-2 font-medium transition-colors ${
                subTab === "remove-degree"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Remove Degree
            </button>
          </div>

          {/* Add Degree Tab */}
          {subTab === "add-degree" && (
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Degree Program</h3>
              
              <form onSubmit={handleAddDegree} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={degreeData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={degreeData.code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., BSCS2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={degreeData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter degree program description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Image (Optional)
                  </label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-300 hover:border-teal-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImage}
                    />
                    
                    {uploadingImage ? (
                      <div className="py-4">
                        <svg className="animate-spin h-10 w-10 text-teal-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </div>
                    ) : imagePreview ? (
                      <div className="space-y-3">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-40 mx-auto rounded-lg shadow-md"
                        />
                        <div className="flex gap-2 justify-center">
                          <label
                            htmlFor="image-upload"
                            className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 cursor-pointer transition-colors"
                          >
                            Change Image
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setDegreeData(prev => ({ ...prev, previewImage: '' }));
                            }}
                            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                          </label>
                          <p className="pl-1 inline">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    name="adminNotes"
                    value={degreeData.adminNotes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Internal notes for administrators"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                >
                  Add Degree Program
                </button>
              </form>
              </div>
            </div>
          )}

          {/* Edit Degree Tab */}
          {subTab === "edit-degree" && (
            <div className="flex justify-center">
              <div className="w-full max-w-6xl">
              {!editingDegree ? (
                <div>
                  {degreePrograms.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      </svg>
                      <p className="text-gray-500 text-lg">No degree programs available</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                      <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Courses
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {degreePrograms.map((degree) => (
                            <tr key={degree._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{degree.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{degree.code}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{degree.courses?.length || 0}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEditDegree(degree)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Degree Program</h3>
                  <form onSubmit={handleUpdateDegree} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Degree Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editDegreeData.title}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., Bachelor of Science in Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Degree Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={editDegreeData.code}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., BSCS2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editDegreeData.description}
                        onChange={handleEditInputChange}
                        required
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter degree program description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        name="previewImage"
                        value={editDegreeData.previewImage}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        name="adminNotes"
                        value={editDegreeData.adminNotes}
                        onChange={handleEditInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Internal notes for administrators"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                      >
                        Update Degree Program
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDegree(null);
                          setEditDegreeData({
                            title: "",
                            code: "",
                            description: "",
                            previewImage: "",
                            adminNotes: ""
                          });
                        }}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Remove Degree Tab */}
          {subTab === "remove-degree" && (
            <div className="flex justify-center">
              <div className="w-full max-w-6xl">
              {degreePrograms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No degree programs available</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Degree Programs
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lecturers
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {degreePrograms.map((degree) => (
                        <tr key={degree._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{degree.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{degree.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{degree.courses?.length || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{degree.lecturers?.length || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteDegree(degree._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}
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
    </div>
  );
};

export default ManageDegree;
