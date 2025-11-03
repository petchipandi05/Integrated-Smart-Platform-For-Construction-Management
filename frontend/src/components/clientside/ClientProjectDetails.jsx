import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { URL } from '../../../url';

const ClientProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [divisionProgress, setDivisionProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          throw new Error('Please log in to view project details.');
        }
        console.log('Fetch Project Auth Header:', `Bearer ${token}`);
        const response = await axios.get(URL+`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projectData = response.data.project;
        setProject(projectData);

        const progressResponse = await axios.get(URL+`/api/progress/${id}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Progress Response:', progressResponse.data);
        const progressUpdates = Array.isArray(progressResponse.data.progressUpdates) ? progressResponse.data.progressUpdates : [];
        
        // Calculate latest progress per division
        const progressMap = {};
        projectData.divisions.forEach((division) => {
          const divisionUpdates = progressUpdates.filter((update) => update.division === division).sort((a, b) => new Date(b.dateUpdated) - new Date(a.dateUpdated));
          const latestProgress = divisionUpdates.length > 0 ? divisionUpdates[0].progress : 0;
          progressMap[division] = latestProgress;
        });

        const tempDivisionProgress = projectData.divisions.map((division) => ({
          name: division,
          progress: progressMap[division] || 0,
        }));
        setDivisionProgress(tempDivisionProgress);
      } catch (error) {
        console.error('Error fetching project details:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, navigate]);

  // Calculate total progress based on the latest division progress values
  const totalProgress = divisionProgress.length
    ? Math.round(
        divisionProgress.reduce((acc, curr) => acc + curr.progress, 0) / divisionProgress.length
      )
    : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8 pt-24 max-w-7xl mx-auto">
        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={project.imageUrl || 'https://via.placeholder.com/400'}
              alt={project.name}
              className="w-full md:w-1/3 h-64 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#002333] mb-4">Project Name: {project.name}</h1>

              {/* Project Details Section */}
              <div>
                <h2 className="text-lg font-semibold text-[#002333] mb-2">Project Details</h2>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-gray-600">Start Date:</p>
                    <p className="font-semibold">
                      {new Date(project.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Project Status:</p>
                    <p className="font-semibold">{project.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deadline:</p>
                    <p className="font-semibold">
                      {new Date(project.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location:</p>
                    <p className="font-semibold">{project.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Project Divisions:</p>
                    <p className="font-semibold">{project.divisions.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Project Cost:</p>
                    <p className="font-semibold">₱{parseFloat(project.projectCost).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Sq Ft:</p>
                    <p className="font-semibold">{project.totalLandArea}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type of Construction:</p>
                    <p className="font-semibold">{project.projectType}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#002333] mb-4">Progress by Division</h2>
          <BarChart width={600} height={300} data={divisionProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="progress" fill="#8884d8" />
          </BarChart>
        </div>

        {/* Total Progress and Financial Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-[#002333] mb-4">Summary</h2>
          <div className="mt-4 space-y-4">
            {/* Total Progress */}
            <div className="p-4 bg-orange-100 rounded-lg">
              <p className="text-center text-lg">
                Total Progress: <span className="font-bold">{totalProgress}%</span>
              </p>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-center text-lg">
                  Total Labor Cost:{' '}
                  <span className="font-bold">
                    ₱{project.totalLaborCost ? project.totalLaborCost.toLocaleString() : '0'}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-center text-lg">
                  Total Material Cost:{' '}
                  <span className="font-bold">
                    ₱{project.totalMaterialCost ? project.totalMaterialCost.toLocaleString() : '0'}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-orange-100 rounded-lg">
                <p className="text-center text-lg">
                  Grand Project Cost:{' '}
                  <span className="font-bold">
                    ₱{project.grandProjectCost ? project.grandProjectCost.toLocaleString() : '0'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-8 gap-4">
          <button
            onClick={() => navigate(`/clientdashboard/projects/${id}/progress`)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Progress Details
          </button>
          <button
            onClick={() => navigate(`/clientdashboard/projects/${id}/labor`)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Labor Details
          </button>
          <button
            onClick={() => navigate(`/clientdashboard/projects/${id}/materials`)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Material Details
          </button>
          <button
            onClick={() => navigate('/clientdashboard')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientProjectDetails;