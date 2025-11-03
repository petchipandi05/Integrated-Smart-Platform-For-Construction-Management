import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import Header from './Header';
import { URL } from '../../../url';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const token = localStorage.getItem('token');
        if (!user.id || !token) {
          setError('Please log in to view your projects.');
          navigate('/login');
          return;
        }

        const response = await axios.get(URL+"/api/projects/client/projects", {
          headers: { Authorization: `Bearer ${token}` },
          params: { clientId: user.id },
        });

        console.log('API Response:', response.data);
        setProjects(response.data.projects || []);
      } catch (err) {
        console.error('Fetch Projects Error:', err);
        setError(err.response?.data?.message || 'Failed to fetch projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();

    const handleUpdateUnviewedCount = (event) => {
      const newTotalUnviewed = event.detail;
      setProjects((prevProjects) =>
        prevProjects.map((project) => ({
          ...project,
          unviewedCount: project.unviewedCount > 0 ? Math.max(0, project.unviewedCount - 1) : 0,
        }))
      );
      window.dispatchEvent(new CustomEvent('updateUnviewedCount', { detail: newTotalUnviewed }));
    };
    window.addEventListener('updateUnviewedCount', handleUpdateUnviewedCount);

    return () => {
      window.removeEventListener('updateUnviewedCount', handleUpdateUnviewedCount);
    };
  }, [navigate]);

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter((project) => project.status.toLowerCase() === filter.toLowerCase());

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-red-500">Error: {error}</div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8 pt-24 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#002333] mb-2">
              Welcome, {user.name || 'Client'}!
            </h1>
            <p className="text-gray-600">Here’s an overview of your construction projects.</p>
          </div>
        </div>

        <div className="mb-8 flex gap-4">
          {['All', 'Ongoing', 'Finished'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => handleFilterChange(filterOption)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                filter === filterOption
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:text-orange-500'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No projects found for this filter.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/clientdashboard/projects/${project._id}`)} // Fixed path
              >
                <img
                  src={project.imageUrl || 'https://via.placeholder.com/300'}
                  alt={project.projectName}
                  className="w-full h-48 object-cover"
                />
                {project.unviewedCount > 0 && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-[#002333] mb-2 truncate">
                    {project.projectName}
                  </h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Status:</strong> {project.status}</p>
                    <p>
                      <strong>Progress:</strong>{' '}
                        {Array.isArray(project.progressUpdates) && project.progressUpdates.length > 0
                          ? `${(
                              project.progressUpdates.reduce((sum, update) => sum + (update.progress || 0), 0) /
                              project.progressUpdates.length
                            ).toFixed(0)}%`
                          : '0%'}
                     </p>
                    <p>
                      <strong>Deadline:</strong>{' '}
                      {new Date(project.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    View Details
                  </button>
                  {project.unviewedCount > 0 && (
                    <div className="mt-2 text-sm text-red-500">
                      Unviewed Updates: {project.unviewedCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientDashboard;