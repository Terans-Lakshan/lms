/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import defaultDegreeImage from '../assets/degreeCard.jpg';

const DegreeCard = ({ degree = {}, userRole = '', onEnrollmentSuccess, enrolledPrograms = [] }) => {
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [assigningLecturer, setAssigningLecturer] = useState(false);

  // Check if this degree is already enrolled by the student
  const isEnrolled = userRole === 'student' && enrolledPrograms && enrolledPrograms.some(
    (enroll) => enroll.degreeProgram && (enroll.degreeProgram._id === degree._id || enroll.degreeProgram === degree._id)
  );

  const fetchLecturers = async () => {
    setLoadingLecturers(true);
    try {
      const response = await axios.get('http://localhost:3000/api/auth/lecturers');
      setLecturers(response.data);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      toast.error('Failed to load lecturers');
    } finally {
      setLoadingLecturers(false);
    }
  };

  const handleAssignLecturer = async (lecturerId) => {
    setAssigningLecturer(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/degree-programs/assign-lecturer',
        {
          degreeProgramId: degree._id,
          lecturerId: lecturerId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Lecturer assigned successfully!');
      setShowLecturerModal(false);
      
      // Trigger refresh if callback provided
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess();
      }
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      const message = error.response?.data?.message || 'Failed to assign lecturer';
      toast.error(message);
    } finally {
      setAssigningLecturer(false);
    }
  };

  const getButtonText = () => {
    switch (userRole) {
      case 'student':
        return isEnrolled ? 'Enrolled' : 'Enroll';
      case 'lecturer':
        return 'Teach';
      case 'admin':
        return 'Assign Lecturer';
      default:
        return 'View';
    }
  };

  const handleButtonClick = async () => {
    if (userRole === 'student') {
      if (isEnrolled) {
        toast.success('You are already enrolled in this program.');
        return;
      }
      // Send enrollment request to admin
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to enroll');
          return;
        }

        console.log('Sending enrollment request for degree:', degree._id);
        console.log('Token:', token ? 'Present' : 'Missing');

        const response = await axios.post(
          'http://localhost:3000/api/notifications/enrollment-request',
          { degreeProgramId: degree._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Enrollment response:', response.data);
        toast.success('Enrollment request sent to admin!');
        
        // Trigger refresh if callback provided
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        }
      } catch (error) {
        console.error('Enrollment error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.response?.data?.message);
        const message = error.response?.data?.message || 'Failed to send enrollment request';
        toast.error(message);
      }
    } else if (userRole === 'lecturer') {
      // Send teach request to admin
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to request teaching');
          return;
        }

        console.log('Sending teach request for degree:', degree._id);

        await axios.post(
          'http://localhost:3000/api/notifications/teach-request',
          { degreeProgramId: degree._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success('Teach request sent to admin!');
        
        // Trigger refresh if callback provided
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        }
      } catch (error) {
        console.error('Teach request error:', error);
        const message = error.response?.data?.message || 'Failed to send teach request';
        toast.error(message);
      }
    } else if (userRole === 'admin') {
      setShowLecturerModal(true);
      fetchLecturers();
    }
  };

  const getLecturerNames = () => {
    if (!degree.lecturers || degree.lecturers.length === 0) {
      return 'No lecturer assigned yet';
    }
    return degree.lecturers.map(lecturer => 
      `${lecturer.name?.first || ''} ${lecturer.name?.last || ''}`.trim() || 'Unknown'
    ).join(', ');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* First div - Background Image with Title */}
        <div 
          className="relative h-48 bg-cover bg-center flex items-center justify-center"
          style={{ 
            backgroundImage: `url(${degree.previewImage || defaultDegreeImage})`,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backgroundBlendMode: 'darken'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <h3 className="relative z-10 text-white text-2xl font-bold text-center px-4">
            {degree.title || 'Untitled Degree Program'}
          </h3>
        </div>
        
        {/* Second div - Course details */}
        <div className="p-5">
          <div className="mb-3">
            <span className="text-sm font-semibold text-gray-600">Course Code: </span>
            <span className="text-sm text-gray-800 font-medium">{degree.code || 'N/A'}</span>
          </div>

          <div className="mb-3">
            <p className="text-gray-600 text-sm line-clamp-3">
              {degree.description || 'No description available'}
            </p>
          </div>

          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-600">Lecturer: </span>
            <span className="text-sm text-gray-800">{getLecturerNames()}</span>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleButtonClick}
            className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition ${isEnrolled ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isEnrolled}
          >
            {getButtonText()}
          </button>
        </div>
      </div>

      {/* Lecturer Selection Modal */}
      {showLecturerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Assign Lecturer</h2>
                <button
                  onClick={() => setShowLecturerModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={assigningLecturer}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Select a lecturer to assign to <span className="font-semibold">{degree.title}</span></p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingLecturers ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : lecturers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500">No lecturers found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lecturers.map((lecturer) => (
                    <div
                      key={lecturer._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {lecturer.name?.first} {lecturer.name?.last}
                        </h3>
                        <p className="text-sm text-gray-600">{lecturer.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Reg No: {lecturer.registrationNo}</p>
                      </div>
                      <button
                        onClick={() => handleAssignLecturer(lecturer._id)}
                        disabled={assigningLecturer}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {assigningLecturer ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DegreeCard;
