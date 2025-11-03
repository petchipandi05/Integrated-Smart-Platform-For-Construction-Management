import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import axios from 'axios';
import Sidebar from './Sidebar';
import { URL } from '../../../url';
const ProjectDetails = () => {
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
        const response = await axios.get(URL+`/api/projects/${id}`);
        const projectData = response.data.project;
        setProject(projectData);

        // Fetch progress updates
        const progressResponse = await axios.get(URL+`/api/progress/${id}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
         const progressUpdates = Array.isArray(progressResponse.data.progressUpdates) ? progressResponse.data.progressUpdates : [];

        // Calculate latest progress per division
        const progressMap = {};
        projectData.divisions.forEach((division) => {
          // Filter updates for this division and sort by dateUpdated (descending)
          const divisionUpdates = progressUpdates
            .filter((update) => update.division === division)
            .sort((a, b) => new Date(b.dateUpdated) - new Date(a.dateUpdated));

          // Take the latest update (first item after sorting)
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
        setError('Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  // Calculate total progress based on the latest division progress values
  const totalProgress = divisionProgress.length
    ? Math.round(
        divisionProgress.reduce((acc, curr) => acc + curr.progress, 0) / divisionProgress.length
      )
    : 0;

  if (loading) {
    return <div className="p-8 text-center">Loading project details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="p-8 text-center">Project not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="projects" />
      <div className="flex-1 overflow-auto">
        <div className="p-8 bg-white m-4 rounded-lg shadow">
          <div className="flex gap-8 mb-8">
            <div className="w-64 h-64 rounded-lg relative overflow-hidden group">
              <img
                src={project.imageUrl || 'https://tse3.mm.bing.net/th?id=OIP.-ZDi-BUoHXD79XUIYKPm0AHaE_&pid=Api&P=0&h=180'}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-6">Project Name: {project.name}</h1>

              {/* User Details Section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">User Details</h2>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-semibold">{project.user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-semibold">{project.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone Number:</p>
                    <p className="font-semibold">{project.user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Project Details Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Project Details</h2>
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

          {/* Progress Chart */}
          <BarChart width={600} height={300} data={divisionProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="progress" fill="#8884d8" />
          </BarChart>

          {/* Total Progress and Financial Summary */}
          <div className="mt-4 space-y-4">
            {/* Total Progress */}
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-center text-lg">
                Total Progress: <span className="font-bold">{totalProgress}%</span>
              </p>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="text-center text-lg">
                  Total Labor Cost:{' '}
                  <span className="font-bold">
                    ₱{project.totalLaborCost ? project.totalLaborCost.toLocaleString() : '0'}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="text-center text-lg">
                  Total Material Cost:{' '}
                  <span className="font-bold">
                    ₱{project.totalMaterialCost ? project.totalMaterialCost.toLocaleString() : '0'}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-blue-200 rounded-lg">
                <p className="text-center text-lg">
                  Grand Project Cost:{' '}
                  <span className="font-bold">
                    ₱{project.grandProjectCost ? project.grandProjectCost.toLocaleString() : '0'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => navigate('/admin/projectsection')}
            >
              Back
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => navigate(`/admin/projectsection/details/${id}/labor-management`)}
            >
              Labor Management
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => navigate(`/admin/projectsection/details/${id}/material-track`)}
            >
              Material Track
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => navigate(`/admin/projectsection/details/${id}/viewfullprogress`)}
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;