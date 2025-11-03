import  { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { URL } from '../../../url';

const NewProjectForm = ({ onClose, onSave, editProjectId }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    location: '',
    cost: '',
    startingDate: '',
    deadline: '',
    totalLandArea: '',
    typeOfConstruction: '',
    email: '',
    divisions: {
      comfortRoom: false,
      floor: false,
      layout: false,
      road: false,
      roof: false,
      sample: false,
      windows: false,
    },
    projectImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (editProjectId) {
        setLoading(true);
        try {
          const response = await axios.get(URL + `/api/projects/${editProjectId}`);
          console.log('Full API Response:', JSON.stringify(response.data, null, 2)); // Debug the response
          const project = response.data.project || response.data; // Handle if project is top-level

          const startDate = project.startingDate || project.startDate || project.beginDate;
          if (startDate && isNaN(new Date(startDate).getTime())) {
            console.warn('Invalid startingDate:', startDate);
          }

          setFormData({
            projectName: project.projectName || project.name || '',
            location: project.location || '',
            cost: project.cost || project.projectCost || '',
            startingDate: startDate && !isNaN(new Date(startDate).getTime())
              ? new Date(startDate).toISOString().split('T')[0]
              : '',
            deadline: project.deadline && !isNaN(new Date(project.deadline).getTime())
              ? new Date(project.deadline).toISOString().split('T')[0]
              : '',
            totalLandArea: project.totalLandArea || '',
            typeOfConstruction: project.typeOfConstruction || project.constructionType || project.projectType || ''
              ? String(project.typeOfConstruction || project.constructionType || project.projectType)
                  .charAt(0)
                  .toUpperCase() +
                String(project.typeOfConstruction || project.constructionType || project.projectType).slice(1).toLowerCase()
              : '',
            email: project.user?.email || project.email || '',
            divisions: project.divisions?.reduce((acc, div) => ({
              ...acc,
              [div.toLowerCase()]: true,
            }), {
              comfortRoom: false,
              floor: false,
              layout: false,
              road: false,
              roof: false,
              sample: false,
              windows: false,
            }) || {
              comfortRoom: false,
              floor: false,
              layout: false,
              road: false,
              roof: false,
              sample: false,
              windows: false,
            },
            projectImage: null,
          });
          if (project.imageUrl) {
            setImagePreview(project.imageUrl);
          }
        } catch (error) {
          console.error('Error fetching project details:', error);
          alert('Failed to load project details');
        } finally {
          setLoading(false);
        }
      } else {
        setFormData({
          projectName: '',
          location: '',
          cost: '',
          startingDate: '',
          deadline: '',
          totalLandArea: '',
          typeOfConstruction: '',
          email: '',
          divisions: {
            comfortRoom: false,
            floor: false,
            layout: false,
            road: false,
            roof: false,
            sample: false,
            windows: false,
          },
          projectImage: null,
        });
        setImagePreview(null);
      }
    };
    fetchProjectDetails();
  }, [editProjectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        projectImage: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      divisions: {
        ...prev.divisions,
        [name]: checked,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{editProjectId ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="flex justify-center items-center flex-col">
                  {imagePreview ? (
                    <div className="relative w-full h-48 mb-4">
                      <img src={imagePreview} alt="Project preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({ ...prev, projectImage: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image-upload"
                            name="projectImage"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name:</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost:</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date:</label>
                <input
                  type="date"
                  name="startingDate"
                  value={formData.startingDate}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline:</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Land Area:</label>
                <input
                  type="text"
                  name="totalLandArea"
                  value={formData.totalLandArea}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g., 5000 sq ft"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Construction:</label>
                <select
                  name="typeOfConstruction"
                  value={formData.typeOfConstruction}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g., user@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Divisions:</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries({
                  comfortRoom: 'Comfort Room',
                  floor: 'Floor',
                  layout: 'Layout',
                  road: 'Road',
                  roof: 'Roof',
                  sample: 'Sample',
                  windows: 'Windows',
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData.divisions[key] || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray- Bonsai">
              Close
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {editProjectId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectForm;