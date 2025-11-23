import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CourseCard = ({ course = {}, userRole = '', onActionSuccess, isEnrolled = false, enrollmentStatus = 'not_enrolled' }) => {
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/enrollments/course',
        { courseId: course._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || 'Enrollment request sent successfully!');
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || 'Failed to send enrollment request');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    setUnenrolling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        'http://localhost:3000/api/enrollments/course',
        { 
          headers: { Authorization: `Bearer ${token}` },
          data: { courseId: course._id }
        }
      );
      toast.success('Successfully unenrolled from course!');
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error('Unenrollment error:', error);
      toast.error(error.response?.data?.message || 'Failed to unenroll from course');
    } finally {
      setUnenrolling(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadMaterial = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('courseId', course._id);

      await axios.post(
        'http://localhost:3000/api/upload-course-material',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      toast.success('Material uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (userRole === 'student') {
      const isPending = enrollmentStatus === 'pending';
      const isEnrolledStatus = enrollmentStatus === 'enrolled' || isEnrolled;
      
      return (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleEnroll}
            disabled={enrolling || isEnrolledStatus || isPending}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition text-sm ${
              isEnrolledStatus 
                ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-300' 
                : isPending
                ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed border border-yellow-300'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600'
            } ${enrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {enrolling ? 'Sending...' : isEnrolledStatus ? 'Enrolled' : isPending ? 'Pending' : 'Enroll'}
          </button>
          {isEnrolledStatus && (
            <button
              onClick={handleUnenroll}
              disabled={unenrolling}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {unenrolling ? 'Unenrolling...' : 'Unenroll'}
            </button>
          )}
        </div>
      );
    }

    if (userRole === 'lecturer') {
      return (
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full mt-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Material
        </button>
      );
    }

    return null; // admin - no button
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-5 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 leading-tight flex-1 pr-2">
            {course.title || 'Untitled Course'}
          </h3>
          <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold shadow-sm whitespace-nowrap border border-teal-200">
            {course.code || 'N/A'}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {course.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="font-semibold">{course.credit || 0}</span>
            <span className="text-gray-500">Credits</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">{course.resources?.length || 0}</span>
          </div>
        </div>

        {getButtonContent()}
      </div>

      {/* Upload Modal for Lecturer */}
      {showUploadModal && userRole === 'lecturer' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Upload Course Material</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Course: <span className="font-semibold">{course.title}</span></p>
              <p className="text-sm text-gray-600">Code: <span className="font-semibold">{course.code}</span></p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                disabled={loading}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadMaterial}
                disabled={!selectedFile || loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseCard;