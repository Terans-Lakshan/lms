import React from 'react';

const RequestNotification = ({ notification, onAccept, onReject }) => {
  const isStudentRequest = notification.type === 'enrollment_request';
  const requestType = isStudentRequest ? 'Student Request' : 'Lecturer Request';
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow mb-3 relative">
      {/* Request Type Badge + Delete Button */}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isStudentRequest 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-purple-100 text-purple-700'
        }`}>
          {requestType}
        </span>
        <button
          onClick={() => notification.onDelete && notification.onDelete(notification._id)}
          className="ml-2 p-1 rounded hover:bg-red-100 text-red-600"
          title="Delete Notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${
          notification.status === 'accepted' 
            ? 'bg-green-100 text-green-700' 
            : notification.status === 'rejected'
            ? 'bg-red-100 text-red-700'
            : 'text-gray-500'
        }`}>
          {notification.status === 'accepted' ? 'Accepted' : notification.status === 'rejected' ? 'Rejected' : new Date(notification.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Student/Lecturer Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {notification.requester?.name?.first} {notification.requester?.name?.last}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="text-sm text-gray-600">
            <span className="font-medium">{isStudentRequest ? 'Registration No:' : 'Email:'}</span> {isStudentRequest ? notification.requester?.registrationNo : notification.requester?.email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm text-gray-600">
            <span className="font-medium">Degree Name:</span> {notification.degreeProgram?.title}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {notification.status === 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onAccept(notification._id)}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(notification._id)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Reject
          </button>
        </div>
      )}
      
      {notification.status !== 'pending' && (
        <div className="pt-3 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Request {notification.status} on {new Date(notification.respondedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestNotification;
