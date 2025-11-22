import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import defaultDegreeImage from '../assets/degreeCard.jpg';

const DegreeCard = ({ degree = {}, userRole = '', onEnrollmentSuccess }) => {
  const getButtonText = () => {
    switch (userRole) {
      case 'student':
        return 'Enroll';
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
      toast.info('Teach functionality coming soon');
    } else if (userRole === 'admin') {
      toast.info('Assign Lecturer functionality coming soon');
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
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default DegreeCard;
