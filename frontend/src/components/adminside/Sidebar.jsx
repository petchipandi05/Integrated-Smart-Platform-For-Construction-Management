import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UserPlus, Bell, LogOut } from 'lucide-react';
import { useRegistrationContext } from './RegistrationContext'; // Import context

const Sidebar = ({ activeItem }) => {
  const navigate = useNavigate();
  const { unviewedCount } = useRegistrationContext(); // Get unviewed count globally

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginstatus");
    navigate("/login");
  };

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
    { id: 'projects', title: 'Project Management', icon: <ClipboardList className="w-5 h-5" />, path: '/admin/projectsection' },
    { id: 'registrations', title: 'Registrations', icon: <UserPlus className="w-5 h-5" />, path: '/admin/registrations' },
    { id: 'logout', title: 'Logout', icon: <LogOut className="w-5 h-5" />, path: '/', onClick: handleLogout },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Contractor Portal</h1>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick || (() => navigate(item.path))} // Use onClick if defined, otherwise navigate
            className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
              activeItem === item.id
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="ml-3 flex items-center">
              {item.title}
              {item.id === 'registrations' && unviewedCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unviewedCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
