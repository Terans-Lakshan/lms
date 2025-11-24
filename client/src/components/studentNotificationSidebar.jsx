import axios from "axios";

const StudentNotificationSidebar = ({ isOpen, onClose, notifications, onNotificationDeleted }) => {
  if (!isOpen) return null;

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Call the callback to refresh notifications
      if (onNotificationDeleted) {
        onNotificationDeleted();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <aside className={`bg-gradient-to-b from-teal-100 via-teal-50 to-emerald-50 border-l border-gray-200 p-6 overflow-auto transition-all duration-300 ${
      isOpen ? "w-96" : "w-0 p-0 overflow-hidden"
    }`}>
      {isOpen && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
              {notifications.filter(n => n.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => n.status === 'pending').length}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
              title="Hide Notifications"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                    notification.status === 'pending'
                      ? 'bg-blue-50 border-blue-500'
                      : notification.status === 'accepted'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {notification.status === 'pending' && (
                        <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {notification.status === 'accepted' && (
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {notification.status === 'rejected' && (
                        <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className={`text-xs font-semibold uppercase ${
                        notification.status === 'pending'
                          ? 'text-blue-700'
                          : notification.status === 'accepted'
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {notification.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {notification.degreeProgram?.title}
                  </p>
                  <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {notification.status !== 'pending' && notification.respondedAt && (
                    <p className="text-xs text-gray-500 italic flex items-center mt-2">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Responded on {new Date(notification.respondedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default StudentNotificationSidebar;
