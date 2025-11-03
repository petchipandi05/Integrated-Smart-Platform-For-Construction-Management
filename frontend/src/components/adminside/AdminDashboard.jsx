import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Layers } from 'lucide-react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { URL } from '../../../url';
const AdminDashboard = () => {

    const [metrics, setMetrics] = useState({
    ongoingProjects: 0,
    completedProjects: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(URL+`/api/projects/metrics`);
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const metricCards = [
    { title: 'Ongoing Projects', value: metrics.ongoingProjects, icon: <Clock className="w-6 h-6 text-blue-600" />, color: 'blue' },
    { title: 'Completed Projects', value: metrics.completedProjects, icon: <CheckCircle className="w-6 h-6 text-green-600" />, color: 'green' },
    { title: 'Total Projects', value: metrics.totalProjects, icon: <Layers className="w-6 h-6 text-purple-600" />, color: 'purple' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="dashboard" />
            <div className="p-6">
          {loading ? (
            <div>Loading metrics...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metricCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="p-2 bg-gray-50 rounded-lg">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>
          )}
          </div>
      </div>
  );
};

export default AdminDashboard;