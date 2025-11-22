/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AccountBar = ({ user, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear localStorage token
      localStorage.removeItem('token');
      
      // Clear cookies
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Account Panel */}
      <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-4 text-white">
          <h3 className="font-semibold text-lg">Account Details</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Name</label>
            <p className="text-sm text-gray-800 font-semibold">
              {user?.name?.first || ''} {user?.name?.last || ''}
            </p>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 font-medium">Email</label>
            <p className="text-sm text-gray-800">{user?.email || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 font-medium">Registration No</label>
            <p className="text-sm text-gray-800">{user?.registrationNo || user?.email?.split('@')[0] || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 font-medium">Role</label>
            <p className="text-sm text-gray-800 capitalize">{user?.role || 'N/A'}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AccountBar;
