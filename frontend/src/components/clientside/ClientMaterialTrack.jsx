import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { URL } from '../../../url';

const ClientMaterialTrack = () => {
  const { id } = useParams(); // projectId
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('usage');
  const [materials, setMaterials] = useState([]);
  const [project, setProject] = useState(null);
  const [totalMaterialCost, setTotalMaterialCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMaterial, setFilterMaterial] = useState(''); // Filter state

  // Default materials with unit prices (kept for filtering reference)
  const defaultMaterials = [
    { name: 'Cement', unitPrice: 250 },
    { name: 'Steel Bar', unitPrice: 300 },
    { name: 'Gravel', unitPrice: 50 },
    { name: 'Sand', unitPrice: 40 },
  ];

  // Fetch materials and project details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [materialsResponse, projectResponse] = await Promise.all([
          axios.get(URL+`/api/projectsmaterial/${id}/materials`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(URL+`/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setMaterials(materialsResponse.data.materials);
        setTotalMaterialCost(materialsResponse.data.totalMaterialCost);
        setProject(projectResponse.data.project);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Filtered usage and purchase info based on selected material
  const allUsageInfo = materials
    .flatMap((m) =>
      m.usageInfo.map((usage) => ({ ...usage, material: m.name }))
    )
    .filter((usage) => !filterMaterial || usage.material === filterMaterial)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const allPurchaseInfo = materials
    .flatMap((m) =>
      m.purchaseInfo.map((purchase) => ({ ...purchase, material: m.name }))
    )
    .filter((purchase) => !filterMaterial || purchase.material === filterMaterial)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate grand total based on filtered purchases
  const filteredTotalMaterialCost = allPurchaseInfo.reduce((sum, purchase) => sum + purchase.totalCost, 0);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="text-2xl font-semibold text-gray-700">Loading...</div></div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="text-2xl font-semibold text-red-500">Error: {error}</div></div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-20 pb-8 flex-grow">
        <div className="bg-white rounded-lg shadow-md w-full">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-700">Material Tracking</h2>
          </div>
          
          <div className="p-4">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'usage' ? 'text-orange-500 border-b-2 border-orange-600' : 'text-orange-500 hover:text-orange-600'}`}
                onClick={() => handleTabChange('usage')}
              >
                Material Usage
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'purchase' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-orange-500 hover:text-orange-600'}`}
                onClick={() => handleTabChange('purchase')}
              >
                Purchase Information
              </button>
            </div>

            {/* Filter Section - Made more compact */}
            <div className="mb-4 flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Filter by Material:</label>
              <select
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value)}
                className="p-2 border border-gray-300 rounded w-48 text-gray-700 bg-white hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Materials</option>
                {defaultMaterials.map((material) => (
                  <option key={material.name} value={material.name}>{material.name}</option>
                ))}
              </select>
            </div>

            {activeTab === 'usage' && (
              <div className="mb-4 w-full">
                <div className="mb-2">
                  <h4 className="text-lg font-medium text-gray-700">Material Usage</h4>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2 text-left text-gray-700">Material</th>
                        <th className="border p-2 text-left text-gray-700">Division</th>
                        <th className="border p-2 text-left text-gray-700">Quantity</th>
                        <th className="border p-2 text-left text-gray-700">Description</th>
                        <th className="border p-2 text-left text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsageInfo.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="border p-2 text-center text-gray-500">No usage entries available.</td>
                        </tr>
                      ) : (
                        allUsageInfo.map((usage) => (
                          <tr key={usage._id}>
                            <td className="border p-2 text-gray-700">{usage.material}</td>
                            <td className="border p-2 text-gray-700">{usage.division}</td>
                            <td className="border p-2 text-gray-700">{usage.quantity} {usage.unit}</td>
                            <td className="border p-2 text-gray-700">{usage.description}</td>
                            <td className="border p-2 text-gray-700">{new Date(usage.date).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'purchase' && (
              <div className="w-full">
                <div className="mb-2">
                  <h4 className="text-lg font-medium text-gray-700">Purchase Information</h4>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2 text-left text-gray-700">Material</th>
                        <th className="border p-2 text-left text-gray-700">Date</th>
                        <th className="border p-2 text-left text-gray-700">Quantity</th>
                        <th className="border p-2 text-left text-gray-700">Supplier</th>
                        <th className="border p-2 text-left text-gray-700">Unit Price</th>
                        <th className="border p-2 text-left text-gray-700">Total Cost</th>
                        <th className="border p-2 text-left text-gray-700">Delivery Note</th>
                        <th className="border p-2 text-left text-gray-700">Invoice #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPurchaseInfo.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="border p-2 text-center text-gray-500">No purchase entries available.</td>
                        </tr>
                      ) : (
                        allPurchaseInfo.map((purchase) => (
                          <tr key={purchase._id}>
                            <td className="border p-2 text-gray-700">{purchase.material}</td>
                            <td className="border p-2 text-gray-700">{new Date(purchase.date).toLocaleDateString()}</td>
                            <td className="border p-2 text-gray-700">{purchase.quantity}</td>
                            <td className="border p-2 text-gray-700">{purchase.supplier}</td>
                            <td className="border p-2 text-gray-700">₱{purchase.unitPrice.toLocaleString()}</td>
                            <td className="border p-2 text-gray-700">₱{purchase.totalCost.toLocaleString()}</td>
                            <td className="border p-2 text-gray-700">{purchase.deliveryNote}</td>
                            <td className="border p-2 text-gray-700">{purchase.invoiceNumber}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200 flex justify-end items-center space-x-2">
                  <h2 className="text-base font-semibold text-gray-700">Total Material Purchase Cost:</h2>
                  <div className="text-lg font-bold text-emerald-500">
                    ₱{filteredTotalMaterialCost.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => navigate(`/clientdashboard/projects/${id}`)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
            >
              Back to Project
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientMaterialTrack;
