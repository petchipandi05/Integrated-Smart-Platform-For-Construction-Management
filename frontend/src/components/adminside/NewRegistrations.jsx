
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import { useRegistrationContext } from "./RegistrationContext";
import { URL } from "../../../url";

const Registrations = () => {
  const navigate = useNavigate();
  const { unviewedCount, setUnviewedCount } = useRegistrationContext(); // Get and update count globally
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(URL+"/api/requestform/registrations");
        setProjects(response.data);
        setLoading(false);
        setUnviewedCount(response.data.filter((p) => !p.verified).length);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [setUnviewedCount]);

  const toggleDetails = async (projectId) => {
    if (expandedProjectId !== projectId && !projects.find((p) => p._id === projectId).verified) {
      try {
        await axios.patch(URL+`/api/requestform/${projectId}/verify`);
        setProjects(
          projects.map((p) => (p._id === projectId ? { ...p, verified: true } : p))
        );
        setUnviewedCount((prev) => prev - 1); // Update global count
      } catch (err) {
        console.error("Error verifying project:", err);
        setError("Failed to mark project as verified");
      }
    }
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="registrations" />
      {/* Rest of the component remains unchanged */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 bg-white m-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Registration Management</h1>
          {projects.length === 0 ? (
            <p className="text-gray-500">No project registrations yet.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project._id} className="border-b border-gray-200">
                  <div
                    className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center relative"
                    onClick={() => toggleDetails(project._id)}
                  >
                    {!project.verified && (
                      <span className="absolute top-2 left-2 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                    <span className="font-medium text-gray-700 ml-6">
                      {project.name} - Submitted by {project.name} on{' '}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-blue-500">
                      {expandedProjectId === project._id ? 'Hide' : 'View'}
                    </span>
                  </div>
                  {expandedProjectId === project._id && (
                    <div className="p-4 bg-white shadow-md rounded-lg mt-2">
                      <div className="grid grid-cols-2 gap-y-4">
                        <div>
                          <p className="text-gray-600"><strong>Client Name:</strong></p>
                          <p className="font-semibold">{project.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600"><strong>Email:</strong></p>
                          <p className="font-semibold">{project.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600"><strong>Phone Number:</strong></p>
                          <p className="font-semibold">{project.phoneNo || 'N/A'}</p> {/* Add this */}
                        </div>
                        <div>
                          <p className="text-gray-600"><strong>Message:</strong></p>
                          <p className="font-semibold">{project.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-8">
            <button
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => navigate('/admin')}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registrations;

