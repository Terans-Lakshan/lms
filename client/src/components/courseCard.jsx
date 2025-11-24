import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CourseCard = ({ course = {}, userRole = '', onActionSuccess, isEnrolled = false, enrollmentStatus = 'not_enrolled', degreeCode = '' }) => {
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [materialLink, setMaterialLink] = useState('');
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    if (uploadType === 'file' && !selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (uploadType === 'link' && !materialLink) {
      toast.error('Please enter a link');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (uploadType === 'link') {
        // Save link directly to course (you'll need to create this endpoint)
        await axios.post(
          'http://localhost:3000/api/courses/add-material-link',
          { 
            courseId: course._id,
            link: materialLink,
            degreeCode: degreeCode || '',
            courseCode: course.code || ''
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Link added successfully!');
      } else {
        // Upload file to S3
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('courseCode', course.code || '');
        formData.append('degreeCode', degreeCode || '');

        await axios.post(
          'http://localhost:3000/api/upload/upload-course-material',
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        toast.success('Material uploaded successfully!');
      }
      
      setShowUploadModal(false);
      setSelectedFile(null);
      setMaterialLink('');
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

  // Check if student is enrolled
  const isStudentEnrolled = userRole === 'student' && (enrollmentStatus === 'enrolled' || isEnrolled);

  return (
    <>
      <div 
        className={`bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-5 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 ${isStudentEnrolled ? 'cursor-pointer' : ''}`}
        onClick={() => isStudentEnrolled && setShowDetailsModal(true)}
      >
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
          {userRole !== 'student' && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">{course.resources?.length || 0}</span>
            </div>
          )}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          {getButtonContent()}
        </div>
      </div>

      {/* Upload Modal for Lecturer */}
      {showUploadModal && userRole === 'lecturer' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Course Material</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setMaterialLink('');
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

            {/* Upload Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Material Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="uploadType"
                    value="file"
                    checked={uploadType === 'file'}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="mr-2 text-teal-600 focus:ring-teal-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">Upload File</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="uploadType"
                    value="link"
                    checked={uploadType === 'link'}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="mr-2 text-teal-600 focus:ring-teal-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">Add Link</span>
                </label>
              </div>
            </div>

            {/* File Upload Section */}
            {uploadType === 'file' && (
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
            )}

            {/* Link Input Section */}
            {uploadType === 'link' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Link
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/resource or https://youtube.com/..."
                  value={materialLink}
                  onChange={(e) => setMaterialLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Add links to YouTube videos, Google Drive files, or external resources
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setMaterialLink('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadMaterial}
                disabled={(uploadType === 'file' && !selectedFile) || (uploadType === 'link' && !materialLink) || loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (uploadType === 'file' ? 'Uploading...' : 'Adding...') : (uploadType === 'file' ? 'Upload' : 'Add Link')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Details Modal for Student */}
      {showDetailsModal && isStudentEnrolled && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
                <p className="text-sm text-gray-600 mt-1">Course Code: <span className="font-semibold text-teal-600">{course.code}</span></p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Course Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Course Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="text-sm text-gray-700"><span className="font-semibold">{course.credit || 0}</span> Credits</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {course.description || 'No description available.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Materials */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Course Materials
                  <span className="text-sm font-normal text-gray-500">({course.resources?.length || 0})</span>
                </h3>

                {course.resources && course.resources.length > 0 ? (
                  <div className="space-y-2">
                    {course.resources.map((material, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Icon based on material type */}
                            {material.type === 'link' ? (
                              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {material.filename || material.url}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                  {material.type === 'link' ? 'External Link' : 'File'}
                                </span>
                                {material.createdAt && (
                                  <span>
                                    {new Date(material.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action button */}
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition whitespace-nowrap"
                          >
                            {material.type === 'link' ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </>
                            )}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No materials available yet</p>
                    <p className="text-gray-400 text-xs mt-1">Check back later for course materials</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseCard;