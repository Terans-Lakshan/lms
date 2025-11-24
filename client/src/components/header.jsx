import { useState } from 'react';
import AccountBar from './accountBar';

const Header = ({ sidebarOpen, setSidebarOpen, user }) => {
  const [accountBarOpen, setAccountBarOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-teal-800 to-emerald-900 border-b border-gray-200 px-10 py-6 flex items-center justify-between rounded-b-lg w-full shadow-lg">
      <div className="flex items-center gap-4 flex-1">
        {/* Burger Icon - Always in Header */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Geology Learning Management System
          </h1>
          <p className="text-xs text-teal-100 mt-1 tracking-wider">University of Peradeniya - PGIS</p>
        </div>
      </div>

      <div className="relative">
        <button 
          onClick={() => setAccountBarOpen(!accountBarOpen)}
          className="p-2 hover:bg-teal-700 rounded-lg" 
          title="Account"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        
        <AccountBar 
          user={user} 
          isOpen={accountBarOpen} 
          onClose={() => setAccountBarOpen(false)} 
        />
      </div>
    </header>
  );
};

export default Header;