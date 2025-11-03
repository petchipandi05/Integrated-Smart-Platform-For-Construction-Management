import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash, Save, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { URL } from '../../../url';

const LaborManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [laborRecords, setLaborRecords] = useState([]);
  const [totalLaborCost, setTotalLaborCost] = useState(0);
  const [laborTypes] = useState([
    { id: 1, type: 'Mason', dailyRate: 800 },
    { id: 2, type: 'Helper', dailyRate: 500 },
    { id: 3, type: 'Carpenter', dailyRate: 750 },
    { id: 4, type: 'Electrician', dailyRate: 900 },
    { id: 5, type: 'Plumber', dailyRate: 850 },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    laborTypeId: '',
    numberOfWorkers: 1,
    date: new Date().toISOString().split('T')[0],
    rate: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaborRecords = async () => {
      try {
        const response = await axios.get(URL+`/api/projectslabor/${id}/labor`);
        const records = response.data.laborRecords.map(record => ({
          id: record._id,
          laborTypeId: laborTypes.find(type => type.type === record.laborType)?.id || '',
          numberOfWorkers: record.numberOfWorkers,
          date: new Date(record.date).toISOString().split('T')[0],
          rate: record.rate,
          description: record.description,
          totalWage: record.totalWage,
        }));
        setLaborRecords(records);
        setTotalLaborCost(response.data.totalLaborCost);

        const initialExpandedState = {};
        records.forEach(record => {
          initialExpandedState[record.date] = false;
        });
        setExpandedDates(initialExpandedState);
      } catch (err) {
        setError('Failed to load labor records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLaborRecords();
  }, [id]);

  const toggleDateExpansion = (date) => {
    setExpandedDates({
      ...expandedDates,
      [date]: !expandedDates[date],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'laborTypeId') {
      const selectedType = laborTypes.find(type => type.id === parseInt(value));
      setFormData({
        ...formData,
        laborTypeId: parseInt(value),
        rate: selectedType ? selectedType.dailyRate : '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const calculateTotalWage = (rate, numberOfWorkers) => {
    return rate * numberOfWorkers;
  };

  const handleAddRecord = async () => {
    const totalWage = calculateTotalWage(
      parseInt(formData.rate),
      parseInt(formData.numberOfWorkers)
    );
    const laborType = laborTypes.find(type => type.id === formData.laborTypeId)?.type;

    try {
      const response = await axios.post(URL+`/api/projectslabor/${id}/labor`, {
        laborType,
        numberOfWorkers: parseInt(formData.numberOfWorkers),
        date: formData.date,
        rate: parseInt(formData.rate),
        description: formData.description,
        totalWage,
      });

      const newRecord = {
        id: response.data.labor._id,
        laborTypeId: formData.laborTypeId,
        numberOfWorkers: parseInt(formData.numberOfWorkers),
        date: formData.date,
        rate: parseInt(formData.rate),
        description: formData.description,
        totalWage,
      };

      setLaborRecords([...laborRecords, newRecord]);
      setTotalLaborCost(prev => prev + totalWage);
      setExpandedDates({
        ...expandedDates,
        [formData.date]: true,
      });
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError('Failed to add labor record');
      console.error(err);
    }
  };

  const handleEditRecord = async () => {
    const totalWage = calculateTotalWage(
      parseInt(formData.rate),
      parseInt(formData.numberOfWorkers)
    );
    const laborType = laborTypes.find(type => type.id === formData.laborTypeId)?.type;

    try {
      const oldRecord = laborRecords.find(record => record.id === editingId);
      await axios.put(URL+`/api/projectslabor/${id}/labor/${editingId}`, {
        laborType,
        numberOfWorkers: parseInt(formData.numberOfWorkers),
        date: formData.date,
        rate: parseInt(formData.rate),
        description: formData.description,
        totalWage,
      });

      const updatedRecords = laborRecords.map(record =>
        record.id === editingId
          ? { ...formData, id: editingId, totalWage, laborTypeId: formData.laborTypeId }
          : record
      );
      setLaborRecords(updatedRecords);
      setTotalLaborCost(prev => prev - oldRecord.totalWage + totalWage);
      setEditingId(null);
      resetForm();
    } catch (err) {
      setError('Failed to update labor record');
      console.error(err);
    }
  };

  const handleDeleteRecord = async (laborId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const recordToDelete = laborRecords.find(record => record.id === laborId);
        await axios.delete(URL+`/api/projectslabor/${id}/labor/${laborId}`);
        setLaborRecords(laborRecords.filter(record => record.id !== laborId));
        setTotalLaborCost(prev => prev - recordToDelete.totalWage);
      } catch (err) {
        setError('Failed to delete labor record');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      laborTypeId: '',
      numberOfWorkers: 1,
      date: new Date().toISOString().split('T')[0],
      rate: '',
      description: '',
    });
  };

  const startEditing = (record) => {
    setFormData({
      laborTypeId: record.laborTypeId,
      numberOfWorkers: record.numberOfWorkers,
      date: record.date,
      rate: record.rate.toString(),
      description: record.description,
    });
    setEditingId(record.id);
  };

  const handleSearchDateChange = (e) => {
    setSearchDate(e.target.value);
  };

  const filteredRecords = laborRecords.filter(record =>
    !searchDate || record.date === searchDate
  );

  const recordsByDate = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) acc[record.date] = [];
    acc[record.date].push(record);
    return acc;
  }, {});

  const sortedDates = Object.keys(recordsByDate).sort((a, b) => new Date(b) - new Date(a));

  const dailyTotals = {};
  sortedDates.forEach(date => {
    dailyTotals[date] = recordsByDate[date].reduce((sum, record) => sum + record.totalWage, 0);
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar activeItem="projects" />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Labor Management</h1>
          </div>
        </header>
        <main className="flex-grow py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-6">
              <div></div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600"
              >
                <Plus size={20} className="mr-2" />
                Add Labor Record
              </button>
            </div>
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Search Records
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search by Date</label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={handleSearchDateChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {sortedDates.length > 0 ? (
                sortedDates.map(date => (
                  <div key={date} className="bg-white rounded shadow overflow-hidden">
                    <div
                      className="bg-gray-200 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-300"
                      onClick={() => toggleDateExpansion(date)}
                    >
                      <div className="flex items-center">
                        {expandedDates[date] ? <ChevronUp size={20} className="mr-2" /> : <ChevronDown size={20} className="mr-2" />}
                        <h3 className="font-semibold">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                      </div>
                      <div className="font-semibold text-green-600">
                        Daily Total: ₱{dailyTotals[date].toLocaleString()}
                      </div>
                    </div>
                    {expandedDates[date] && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labor Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workers</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₱)</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₱)</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recordsByDate[date].map(record => (
                              <tr key={record.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{laborTypes.find(t => t.id === record.laborTypeId)?.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.numberOfWorkers}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.rate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{record.totalWage.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => startEditing(record)}
                                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRecord(record.id)}
                                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded shadow text-center">
                  <p className="text-gray-500">No labor records found for the selected date.</p>
                </div>
              )}
            </div>
            <div className="mt-6 bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Total Labor Cost</h2>
                <div className="text-xl font-bold text-green-600">
                  ₱{totalLaborCost.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(`/admin/projectsection/details/${id}`)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Back to Project
              </button>
            </div>
          </div>
        </main>
      </div>
      {(showAddForm || editingId !== null) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingId !== null ? 'Edit Labor Record' : 'Add Labor Record'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor Type</label>
                <select
                  name="laborTypeId"
                  value={formData.laborTypeId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Labor Type</option>
                  {laborTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Workers</label>
                <input
                  type="number"
                  name="numberOfWorkers"
                  value={formData.numberOfWorkers}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₱)</label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Describe the work performed"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={editingId !== null ? handleEditRecord : handleAddRecord}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                disabled={!formData.laborTypeId || !formData.numberOfWorkers || !formData.date || !formData.rate}
              >
                <Save size={20} className="mr-2" />
                {editingId !== null ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborManagement;