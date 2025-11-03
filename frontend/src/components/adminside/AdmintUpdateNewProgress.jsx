import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit,X, Trash, Eye } from 'lucide-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Sidebar from './Sidebar';
import { URL as api_url} from '../../../url';

const UpdateProgress = () => {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDivision, setSelectedDivision] = useState('');
  const [newProgress, setNewProgress] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [description, setDescription] = useState('');
  const [progressHistory, setProgressHistory] = useState([]);
  const [project, setProject] = useState(null);
  const [editProgressId, setEditProgressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded?.role || 'Guest');
      } catch (err) {
        console.error('Error decoding token:', err);
        setUserRole('Guest');
      }
    } else {
      setUserRole('Guest');
    }

    const fetchData = async () => {
      try {
        const projectResponse = await axios.get(api_url+`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProject(projectResponse.data.project);

        const progressResponse = await axios.get(api_url+`/api/progress/${id}/progress`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Progress response:', progressResponse.data);
        const progressUpdates = Array.isArray(progressResponse.data.progressUpdates) ? progressResponse.data.progressUpdates : [];

          setProgressHistory(progressUpdates.map(entry => ({
            id: entry._id,
            media: entry.media,
            division: entry.division,
            progress: `${entry.progress}%`,
            dateUpdated: new Date(entry.dateUpdated).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            description: entry.description,
          })));

      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (userRole !== 'Admin') {
      alert('Only admins can update progress.');
      return;
    }
    const formData = new FormData();
    formData.append('division', selectedDivision);
    formData.append('progress', newProgress);
    formData.append('description', description);
    selectedMedia.forEach(media => formData.append('media', media));

    try {
      let response;
      if (editProgressId) {
        response = await axios.put(api_url+`/api/progress/${id}/progress/${editProgressId}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProgressHistory(progressHistory.map(entry =>
          entry.id === editProgressId ? {
            ...entry,
            division: selectedDivision,
            progress: `${newProgress}%`,
            media: response.data.media,
            description,
            dateUpdated: new Date(response.data.dateUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          } : entry
        ));
      } else {
        response = await axios.post(api_url+`/api/progress/${id}/progress`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProgressHistory([...progressHistory, {
          id: response.data._id,
          media: response.data.media,
          division: selectedDivision,
          progress: `${newProgress}%`,
          dateUpdated: new Date(response.data.dateUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          description,
        }]);
      }

      if (!editProgressId) {
        await axios.post(api_url+`/api/progress/${id}/progress/${response.data._id}/notify`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }

      setSelectedDivision('');
      setNewProgress('');
      setSelectedMedia([]);
      setExistingMedia([]);
      setShowProgressForm(false);
      setDescription('');
      setEditProgressId(null);
    } catch (error) {
      console.error('Error submitting progress:', error);
      alert('Failed to save progress: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditProgress = (progressId) => {
    if (userRole !== 'Admin') {
      alert('Only admins can edit progress.');
      return;
    }
    const progressEntry = progressHistory.find((p) => p.id === progressId);
    if (progressEntry) {
      setSelectedDivision(progressEntry.division);
      setNewProgress(progressEntry.progress.replace('%', ''));
      setDescription(progressEntry.description);
      setExistingMedia(progressEntry.media);
      setSelectedMedia([]);
      setEditProgressId(progressId);
      setShowProgressForm(true);
    }
  };

  const handleDeleteProgress = (progressId) => {
    if (userRole !== 'Admin') {
      alert('Only admins can delete progress.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this progress entry?')) {
      try {
        axios.delete(api_url+`/api/progress/${id}/progress/${progressId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProgressHistory(progressHistory.filter((entry) => entry.id !== progressId));
      } catch (error) {
        console.error('Error deleting progress:', error);
        alert('Failed to delete progress: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleViewProgress = (progressId) => {
    navigate(`/admin/projectsection/details/${id}/viewfullprogress/${progressId}`);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedMedia(prevMedia => [...prevMedia, ...files]);
  };

  const removeMedia = (index) => {
    setSelectedMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowProgressForm(false);
      setEditProgressId(null);
      setSelectedDivision('');
      setNewProgress('');
      setSelectedMedia([]);
      setExistingMedia([]);
      setDescription('');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>No project data available</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="projects" />
      <div className="flex-1 overflow-auto">
        <div className="p-8 bg-white m-4 rounded-lg shadow">
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Progress History</h2>
              {userRole === 'Admin' && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setShowProgressForm(true)}
                >
                  New Progress
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Division</th>
                    <th className="border p-2">Progress</th>
                    <th className="border p-2">Date Updated</th>
                    <th className="border p-2">Media</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {progressHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="border p-2 text-center text-gray-500">
                        No progress history available.
                      </td>
                    </tr>
                  ) : (
                    progressHistory.map((entry) => (
                      <tr key={entry.id} className="text-center">
                        <td className="border p-2">{entry.division}</td>
                        <td className="border p-2">{entry.progress}</td>
                        <td className="border p-2">{entry.dateUpdated}</td>
                        <td className="border p-2">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {entry.media.map((media, index) => (
                              media.type === 'image' ? (
                                <img
                                  key={index}
                                  src={media.url}
                                  alt={`Progress ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ) : (
                                <video
                                  key={index}
                                  src={media.url}
                                  controls
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )
                            ))}
                          </div>
                        </td>
                        <td className="border p-2">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewProgress(entry.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                              View
                            </button>
                            {userRole === 'Admin' && (
                              <>
                                <button
                                  onClick={() => handleEditProgress(entry.id)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProgress(entry.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {showProgressForm && userRole === 'Admin' && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={handleModalBackdropClick}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{editProgressId ? 'Edit Progress Entry' : 'New Progress Entry'}</h2>
                  <button
                    onClick={() => setShowProgressForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleProgressSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Division:</label>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="border-2 border-gray-200 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="">Select Division</option>
                      {project.divisions.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">New Progress (%):</label>
                    <input
                      type="number"
                      value={newProgress}
                      onChange={(e) => setNewProgress(e.target.value)}
                      min="0"
                      max="100"
                      className="border-2 border-gray-200 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Upload Media (Images/Videos):</label>
                    <input
                      type="file"
                      onChange={handleMediaChange}
                      className="border-2 border-gray-200 rounded w-full py-2 px-3 text-gray-700"
                      accept="image/*,video/*"
                      multiple
                    />
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, MP4, etc. up to 10MB each (Multiple files allowed)</p>
                    {existingMedia.length > 0 && editProgressId && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {existingMedia.map((media, index) => (
                          <div key={index} className="relative">
                            {media.type === 'image' ? (
                              <img src={media.url} alt={`Existing ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                            ) : (
                              <video src={media.url} controls className="w-20 h-20 object-cover rounded" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedMedia.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedMedia.map((media, index) => (
                          <div key={index} className="relative">
                            {media.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(media)}
                                alt={`Preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded"
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(media)}
                                controls
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Description:</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-2 border-gray-200 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowProgressForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-8">
            <button
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => navigate('/admin/projectsection')}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProgress;