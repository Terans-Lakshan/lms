import { useState } from "react";

const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, navItems }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderNavItem = (item, index) => {
    if (item.children) {
      // Parent item with children
      return (
        <div key={index} className="w-full flex flex-col items-center">
          <button
            onClick={() => toggleExpand(item.id)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-gray-400 w-full"
            title={item.title}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-xs text-gray-700 text-center leading-tight">{item.title}</span>
            <svg 
              className={`w-4 h-4 text-gray-700 transition-transform ${
                expandedItems[item.id] ? "rotate-180" : ""
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedItems[item.id] && (
            <div className="w-full flex flex-col space-y-2 mt-2 px-1">
              {item.children.map((child, childIndex) => (
                <button
                  key={childIndex}
                  onClick={() => {
                    if (child.onClick) {
                      child.onClick();
                    } else {
                      setActiveTab(child.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs ${
                    activeTab === child.id ? "bg-gray-400" : "hover:bg-gray-300"
                  }`}
                  title={child.title}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {child.icon}
                  </div>
                  <span className="text-xs text-gray-700 text-center leading-tight">{child.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular item without children
    if (item.type === "button") {
      return (
        <button
          key={index}
          onClick={() => {
            if (item.onClick) {
              item.onClick();
            } else {
              setActiveTab(item.id);
            }
          }}
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
      );
    }

    // Link item
    return (
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
    );
  };

  return (
    <aside
      className={`bg-gray-200 text-white flex flex-col py-10 transition-all duration-300 ${
        sidebarOpen ? "w-24" : "w-0 overflow-hidden"
      }`}
    >
      
      {/* Navigation */}
      {sidebarOpen && (
        <nav className="flex-1 flex flex-col space-y-4 items-center">
          {navItems.map((item, index) => renderNavItem(item, index))}
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
