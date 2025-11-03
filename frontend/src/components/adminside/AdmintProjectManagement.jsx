import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import  { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, CheckCircle, Edit } from 'lucide-react';
import axios from 'axios';
import NewProjectForm from './NewProjectForm';
import { URL } from '../../../url';

const ProjectSection1 = () => {
    const navigate = useNavigate();
  const [projectStatus, setProjectStatus] = useState('ongoing');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);


  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(URL+`/api/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error.response?.data || error.message);
      alert('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveProject = async (projectData) => {
    try {
      const selectedDivisions = Object.entries(projectData.divisions)
        .filter(([_, checked]) => checked)
        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

      const formData = new FormData();
      formData.append('projectName', projectData.projectName);
      formData.append('location', projectData.location);
      formData.append('cost', projectData.cost);
      formData.append('startingDate', projectData.startingDate);
      formData.append('deadline', projectData.deadline);
      formData.append('totalLandArea', projectData.totalLandArea);
      formData.append('typeOfConstruction', projectData.typeOfConstruction);
      formData.append('divisions', JSON.stringify(selectedDivisions));
      formData.append('email', projectData.email);
      if (projectData.projectImage) {
        formData.append('projectImage', projectData.projectImage);
      }

      let response;
      if (editProjectId) {
        response = await axios.patch(URL+`/api/projects/${editProjectId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',

          },
          
        });
        setProjects(projects.map((project) =>
          project._id === editProjectId ? response.data.project : project
        ));
        setEditProjectId(null);
      } else {
        response = await axios.post(URL+`/api/projects`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setProjects([...projects, response.data.project]);
      }

      setShowNewProjectForm(false);
      alert('Project saved successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while saving the project';
      console.error('Error saving project:', errorMessage);
      alert(errorMessage);
    }
  };

  const handleRemoveProject = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this project?');
    if (!confirmDelete) return;

    try {
      await axios.delete(URL+`/api/projects/${id}`);
      setProjects(projects.filter((project) => project._id !== id));
      alert('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error.response?.data || error.message);
      alert('Failed to delete project');
    }
  };

  const handleFinishProject = async (id) => {
    const confirmFinish = window.confirm('Are you sure you want to mark this project as finished?');
    if (!confirmFinish) return;

    try {
      const response = await axios.patch(URL+`/api/projects/${id}/status`, {
        status: 'finished',
      });
      setProjects(
        projects.map((project) =>
          project._id === id ? response.data.project : project
        )
      );
      alert('Project marked as finished');
    } catch (error) {
      console.error('Error finishing project:', error.response?.data || error.message);
      alert('Failed to finish project');
    }
  };

  const handleEditProject = (id) => {
    setEditProjectId(id);
    setShowNewProjectForm(true);
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.status === projectStatus &&
      (project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProjects.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="projects" />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">List of Projects</h1>
        <button
          onClick={() => {
            setEditProjectId(null);
            setShowNewProjectForm(true);
          }}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded-md ${
            projectStatus === 'ongoing' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border'
          }`}
          onClick={() => setProjectStatus('ongoing')}
        >
          Ongoing
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            projectStatus === 'finished' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border'
          }`}
          onClick={() => setProjectStatus('finished')}
        >
          Finished
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <select
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-md px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-gray-600">records per page</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Search:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-md px-3 py-1 w-64"
            placeholder="Search projects..."
          />
        </div>
      </div>
      {loading ? (
        <div>Loading projects...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-800 font-semibold border-b">Project</th>
                <th className="px-6 py-3 text-left text-gray-800 font-semibold border-b">Location</th>
                <th className="px-6 py-3 text-left text-gray-800 font-semibold border-b">Deadline</th>
                <th className="px-6 py-3 text-left text-gray-800 font-semibold border-b">Total Land Area</th>
                <th className="px-6 py-3 text-left text-gray-800 font-semibold border-b">Type of Construction</th>
                <th className="px-6 py-3 text-center text-gray-800 font-semibold border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((project) => (
                <tr key={project._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{project.projectName}</td>
                  <td className="px-6 py-4">{project.location}</td>
                  <td className="px-6 py-4">
                    {new Date(project.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">{project.totalLandArea}</td>
                  <td className="px-6 py-4">{project.typeOfConstruction}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        onClick={() => navigate(`/admin/projectsection/details/${project._id}`)}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        onClick={() => handleEditProject(project._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        onClick={() => handleRemoveProject(project._id)}
                      >
                        Delete
                      </button>
                      {project.status === 'ongoing' && (
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          onClick={() => handleFinishProject(project._id)}
                        >
                          Finish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} entries
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === index + 1 ? 'bg-blue-600 text-white' : 'border text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {showNewProjectForm && (
        <NewProjectForm
          onClose={() => {
            setShowNewProjectForm(false);
            setEditProjectId(null);
          }}
          onSave={handleSaveProject}
          editProjectId={editProjectId}
        />
      )}
    </div>
      </div>
    </div>
  );
};

export default ProjectSection1;