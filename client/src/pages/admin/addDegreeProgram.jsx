import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar";
import Header from "../../components/header";

const AddDegreeProgram = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    previewImage: "",
    adminNotes: ""
  });

  const navItems = [
    { name: "Dashboard", type: "button", onClick: () => navigate("/admin/dashboard") },
    {
      name: "Manage Degree",
      type: "parent",
      children: [
        { name: "Add Degree", type: "button", active: true },
        { name: "Remove Degree", type: "button", onClick: () => alert("Remove Degree functionality") }
      ]
    },
    { name: "Manage Users", type: "button", onClick: () => navigate("/admin/manage-users") }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.code || !formData.description) {
      alert("Please fill in all required fields (Title, Code, Description)");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/degree-programs",
        formData
      );

      alert("Degree program created successfully!");
      // Reset form
      setFormData({
        title: "",
        code: "",
        description: "",
        previewImage: "",
        adminNotes: ""
      });
      
      // Optionally navigate back to dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error creating degree program:", error);
      const message = error.response?.data?.message || "Failed to create degree program";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navItems={navItems} activeTab="add-degree" />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Add New Degree Program
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onClick={() => navigate("/admin/dashboard")}
                    disabled={loading}
                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddDegreeProgram;
