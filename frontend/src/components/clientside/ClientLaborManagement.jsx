import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { URL } from '../../../url';

const ClientLaborManagement = () => {
  const { id } = useParams(); // projectId
  const navigate = useNavigate();

  // States
  const [laborRecords, setLaborRecords] = useState([]);
  const [totalLaborCost, setTotalLaborCost] = useState(0);
  const [laborTypes] = useState([
    { id: 1, type: 'Mason', dailyRate: 800 },
    { id: 2, type: 'Helper', dailyRate: 500 },
    { id: 3, type: 'Carpenter', dailyRate: 750 },
    { id: 4, type: 'Electrician', dailyRate: 900 },
    { id: 5, type: 'Plumber', dailyRate: 850 },
  ]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch labor records on mount
  useEffect(() => {
    const fetchLaborRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(URL+`/api/projectslabor/${id}/labor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // Toggle date expansion
  const toggleDateExpansion = (date) => {
    setExpandedDates({
      ...expandedDates,
      [date]: !expandedDates[date],
    });
  };

  // Apply date range filter
  const filteredRecords = laborRecords.filter(record => {
    const recordDate = new Date(record.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from && to) {
      return recordDate >= from && recordDate <= to;
    } else if (from) {
      return recordDate >= from;
    } else if (to) {
      return recordDate <= to;
    }
    return true;
  });

  // Group records by date
  const recordsByDate = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) acc[record.date] = [];
    acc[record.date].push(record);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(recordsByDate).sort((a, b) => new Date(b) - new Date(a));

  // Calculate daily totals for filtered records
  const dailyTotals = {};
  sortedDates.forEach(date => {
    dailyTotals[date] = recordsByDate[date].reduce((sum, record) => sum + record.totalWage, 0);
  });

  // Calculate total labor cost based on filtered records
  const filteredTotalLaborCost = filteredRecords.reduce((sum, record) => sum + record.totalWage, 0);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="text-2xl font-semibold text-gray-700">Loading...</div></div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="text-2xl font-semibold text-red-500">Error: {error}</div></div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-20 pb-8 flex-grow">
        <div className="bg-white rounded-lg shadow-md w-full">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-700">Labor Management</h2>
          </div>
          
          <div className="p-4">
            {/* Filter Section - Date Range */}
            <div className="mb-4 flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">From Date:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-48 text-gray-700 bg-white hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">To Date:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-48 text-gray-700 bg-white hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                      <h3 className="font-semibold text-gray-700">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="font-semibold text-emerald-500">
                        Daily Total: ₱{dailyTotals[date].toLocaleString()}
                      </div>
                    </div>
                    {expandedDates[date] && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Labor Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Workers</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rate (₱)</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total (₱)</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recordsByDate[date].map(record => (
                              <tr key={record.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{laborTypes.find(t => t.id === record.laborTypeId)?.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{record.numberOfWorkers}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{record.rate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{record.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">{record.totalWage.toLocaleString()}</td>
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
                  <p className="text-gray-500">No labor records found for the selected date range.</p>
                </div>
              )}
            </div>
            <div className="mt-6 bg-gray-50 p-3 rounded border border-gray-200 flex justify-end items-center space-x-2">
              <h2 className="text-base font-semibold text-gray-700">Total Labor Cost:</h2>
              <div className="text-lg font-bold text-emerald-500">
                ₱{filteredTotalLaborCost.toLocaleString()}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(`/clientdashboard/projects/${id}`)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                Back to Project
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientLaborManagement;
