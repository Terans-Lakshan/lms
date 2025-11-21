const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, navItems }) => {
  return (
    <aside
      className={`bg-gray-200 text-white flex flex-col py-10 transition-all duration-300 ${
        sidebarOpen ? "w-24" : "w-0 overflow-hidden"
      }`}
    >
      
      {/* Navigation */}
      {sidebarOpen && (
        <nav className="flex-1 flex flex-col space-y-4 items-center">
          {navItems.map((item, index) => (
            item.type === "button" ? (
              <button
                key={index}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg ${
                  activeTab === item.id ? "bg-gray-400" : "hover:bg-gray-400"
                }`}
                title={item.title}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs text-gray-700 text-center leading-tight">{item.title}</span>
              </button>
            ) : (
              <a
                key={index}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-gray-400"
                title={item.title}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs text-gray-700 text-center leading-tight">{item.title}</span>
              </a>
            )
          ))}
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
