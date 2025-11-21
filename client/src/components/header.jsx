/* eslint-disable no-unused-vars */
const Header = ({ sidebarOpen, setSidebarOpen, user }) => {
  return (
    <header className="bg-teal-500 border-b border-gray-200 px-10 py-6 flex items-center justify-between rounded-b-lg w-full">
      <div className="flex items-center gap-4 flex-1">
        {/* Burger Icon - Always in Header */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-teal-600 rounded-lg"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-white absolute left-1/2 transform -translate-x-1/2">
          Learning Management System
        </h1>
      </div>

      <div className="relative">
        <button className="p-2 hover:bg-teal-600 rounded-lg" title="Account">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;