import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('HOME');
  const [unviewedCount, setUnviewedCount] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveItem('HOME');
    } else if (location.pathname === '/contact') {
      setActiveItem('CONTACTUS');
    } else if (location.pathname === '/clientdashboard' || location.pathname.startsWith('/clientdashboard/')) {
      setActiveItem('MYPROJECTS');
    }

    //Fetch unviewed count if logged in
    if (token) {
      axios.get('http://localhost:3001/api/projects/client/projects', {
        headers: { Authorization: `Bearer ${token}` },
        params: { clientId: JSON.parse(localStorage.getItem('user')).id },
      }).then(response => {
        const totalUnviewed = response.data.totalUnviewed || 0;
        setUnviewedCount(totalUnviewed);
      }).catch(error => {
        console.error('Error fetching unviewed count:', error);
      });
    }

    // Add event listener for unviewed count updates
    const handleUpdateUnviewedCount = (event) => {
      setUnviewedCount(event.detail);
    };
    window.addEventListener('updateUnviewedCount', handleUpdateUnviewedCount);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('updateUnviewedCount', handleUpdateUnviewedCount);
    };
  }, [location, token]);

  const handleMyProjects = () => {
    if (!token) {
      navigate('/login');
    } else {
      navigate('/clientdashboard');
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#002333]/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="text-white hover:text-orange-500 transition-colors" size={28} />
            <span className="text-white text-2xl font-bold">Buildtrue</span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-8">
              <Link
                to="/"
                className="relative text-white text-sm py-2 px-3 group hover:text-orange-500 transition-colors"
              >
                HOME
                <span
                  className={`absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform origin-left transition-transform duration-300 ${
                    activeItem === 'HOME' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </Link>

              <Link
                to=""
                className="relative text-white text-sm py-2 px-3 group hover:text-orange-500 transition-colors"
              >
                ABOUT US
                <span
                  className={`absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform origin-left transition-transform duration-300 ${
                    activeItem === 'ABOUTUS' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </Link>

              <Link
                to=""
                className="relative text-white text-sm py-2 px-3 group hover:text-orange-500 transition-colors"
              >
                RECENT PROJECTS
                <span
                  className={`absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform origin-left transition-transform duration-300 ${
                    activeItem === 'RECENTPROJECTS' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </Link>

              <Link
                to="/contact"
                className="relative text-white text-sm py-2 px-3 group hover:text-orange-500 transition-colors"
              >
                CONTACT US
                <span
                  className={`absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform origin-left transition-transform duration-300 ${
                    activeItem === 'CONTACTUS' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </Link>

              <button
                onClick={handleMyProjects}
                className="relative text-white text-sm py-2 px-3 group hover:text-orange-500 transition-colors flex items-center"
              >
                MY PROJECTS
                {unviewedCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unviewedCount}
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform origin-left transition-transform duration-300 ${
                    activeItem === 'MYPROJECTS' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </button>
            </nav>

            {token ? (
              <button
                className="ml-6 text-white text-sm bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-md transition-colors border border-transparent hover:border-orange-400"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("loginstatus");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                LOGOUT
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white text-sm bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-md transition-colors border border-transparent hover:border-orange-400 ml-6"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;