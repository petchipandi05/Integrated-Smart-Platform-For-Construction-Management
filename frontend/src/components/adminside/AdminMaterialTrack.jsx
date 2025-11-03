import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Edit, Trash } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
 import { URL } from '../../../url';

const MaterialTrack = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usage');
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingUsageId, setEditingUsageId] = useState(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [project, setProject] = useState(null);
  const [totalMaterialCost, setTotalMaterialCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUsage, setNewUsage] = useState({
    material: '',
    division: '',
    quantity: '',
    unit: '',
    description: '',
    date: '',
  });

  const [newPurchase, setNewPurchase] = useState({
    material: '',
    date: '',
    quantity: '',
    supplier: '',
    unitPrice: '',
    totalCost: '',
    deliveryNote: '',
    invoiceNumber: '',
  });

  const defaultMaterials = [
    { name: 'Cement', unitPrice: 250 },
    { name: 'Steel Bar', unitPrice: 300 },
    { name: 'Gravel', unitPrice: 50 },
    { name: 'Sand', unitPrice: 40 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsResponse, projectResponse] = await Promise.all([
          axios.get(URL+`/api/projectsmaterial/${id}/materials`),
          axios.get(URL+`/api/projects/${id}`),
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

  const allUsageInfo = materials
    .flatMap(m => m.usageInfo.map(usage => ({ ...usage, material: m.name })))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const allPurchaseInfo = materials
    .flatMap(m => m.purchaseInfo.map(purchase => ({ ...purchase, material: m.name })))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleUsageChange = (e) => {
    const { name, value } = e.target;
    setNewUsage({ ...newUsage, [name]: value });
  };

  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    if (name === 'material') {
      const selectedMaterial = defaultMaterials.find(m => m.name === value);
      const unitPrice = selectedMaterial ? selectedMaterial.unitPrice : '';
      setNewPurchase(prev => ({
        ...prev,
        material: value,
        unitPrice: unitPrice.toString(),
        totalCost: prev.quantity && unitPrice ? (parseFloat(prev.quantity) * unitPrice).toString() : prev.totalCost,
      }));
    } else if (name === 'quantity' || name === 'unitPrice') {
      const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(newPurchase.quantity);
      const unitPrice = name === 'unitPrice' ? parseFloat(value) : parseFloat(newPurchase.unitPrice);
      if (!isNaN(quantity) && !isNaN(unitPrice)) {
        setNewPurchase({ ...newPurchase, [name]: value, totalCost: (quantity * unitPrice).toString() });
      } else {
        setNewPurchase({ ...newPurchase, [name]: value });
      }
    } else {
      setNewPurchase({ ...newPurchase, [name]: value });
    }
  };

  const handleUsageSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        materialName: newUsage.material,
        division: newUsage.division,
        quantity: parseInt(newUsage.quantity, 10),
        unit: newUsage.unit,
        description: newUsage.description,
        date: newUsage.date,
        ...(editingUsageId && { usageId: editingUsageId }),
      };
      const response = await axios.post(URL+`/api/projectsmaterial/${id}/materials/usage`, payload);
      setMaterials(prev => {
        const updatedMaterials = prev.filter(m => m.name !== newUsage.material);
        return [...updatedMaterials, response.data];
      });
      setNewUsage({ material: '', division: '', quantity: '', unit: '', description: '', date: '' });
      setShowUsageForm(false);
      setEditingUsageId(null);
    } catch (error) {
      console.error('Error submitting usage:', error);
      alert('Failed to save usage entry');
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        materialName: newPurchase.material,
        date: newPurchase.date,
        quantity: parseInt(newPurchase.quantity, 10),
        supplier: newPurchase.supplier,
        unitPrice: parseFloat(newPurchase.unitPrice),
        totalCost: parseFloat(newPurchase.totalCost),
        deliveryNote: newPurchase.deliveryNote,
        invoiceNumber: newPurchase.invoiceNumber,
        ...(editingPurchaseId && { purchaseId: editingPurchaseId }),
      };
      const response = await axios.post(URL+`/api/projectsmaterial/${id}/materials/purchase`, payload);
      const updatedMaterials = materials.filter(m => m.name !== newPurchase.material);
      setMaterials([...updatedMaterials, response.data]);
      const materialResponse = await axios.get(URL+`/api/projectsmaterial/${id}/materials`);
      setTotalMaterialCost(materialResponse.data.totalMaterialCost);
      setNewPurchase({ material: '', date: '', quantity: '', supplier: '', unitPrice: '', totalCost: '', deliveryNote: '', invoiceNumber: '' });
      setShowPurchaseForm(false);
      setEditingPurchaseId(null);
    } catch (error) {
      console.error('Error submitting purchase:', error);
      alert('Failed to save purchase entry');
    }
  };

  const handleDeleteUsage = async (materialName, usageId) => {
    if (window.confirm('Are you sure you want to delete this usage entry?')) {
      try {
        const response = await axios.delete(URL+`/api/projectsmaterial/${id}/materials/usage/${usageId}`);
        setMaterials(prev => {
          const updatedMaterials = prev.filter(m => m.name !== materialName);
          return [...updatedMaterials, response.data];
        });
      } catch (error) {
        console.error('Error deleting usage:', error);
        alert('Failed to delete usage entry');
      }
    }
  };

  const handleDeletePurchase = async (materialName, purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase entry?')) {
      try {
        const response = await axios.delete(URL+`/api/projectsmaterial/${id}/materials/purchase/${purchaseId}`);
        const updatedMaterials = materials.filter(m => m.name !== materialName);
        setMaterials([...updatedMaterials, response.data]);
        const materialResponse = await axios.get(URL+`/api/projectsmaterial/${id}/materials`);
        setTotalMaterialCost(materialResponse.data.totalMaterialCost);
      } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Failed to delete purchase entry');
      }
    }
  };

  const handleEditUsage = (usage) => {
    setNewUsage({
      material: usage.material,
      division: usage.division,
      quantity: usage.quantity.toString(),
      unit: usage.unit,
      description: usage.description,
      date: usage.date.split('T')[0],
    });
    setEditingUsageId(usage._id);
    setShowUsageForm(true);
  };

  const handleEditPurchase = (purchase) => {
    setNewPurchase({
      material: purchase.material,
      date: purchase.date.split('T')[0],
      quantity: purchase.quantity.toString(),
      supplier: purchase.supplier,
      unitPrice: purchase.unitPrice.toString(),
      totalCost: purchase.totalCost.toString(),
      deliveryNote: purchase.deliveryNote,
      invoiceNumber: purchase.invoiceNumber,
    });
    setEditingPurchaseId(purchase._id);
    setShowPurchaseForm(true);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setShowUsageForm(false);
    setShowPurchaseForm(false);
    setEditingUsageId(null);
    setEditingPurchaseId(null);
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowUsageForm(false);
      setShowPurchaseForm(false);
      setEditingUsageId(null);
      setEditingPurchaseId(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar activeItem="projects" />
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Material Tracking</h2>
          </div>
          <div className="p-6">
            <div className="flex border-b mb-4">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'usage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => handleTabChange('usage')}
              >
                Material Usage
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'purchase' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => handleTabChange('purchase')}
              >
                Purchase Information
              </button>
            </div>

            {activeTab === 'usage' && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Material Usage</h4>
                  <button
                    onClick={() => {
                      setNewUsage({ material: '', division: '', quantity: '', unit: '', description: '', date: '' });
                      setEditingUsageId(null);
                      setShowUsageForm(true);
                    }}
                    className="text-white bg-blue-500 hover:bg-blue-600 py-1 px-3 rounded flex items-center"
                  >
                    <Plus className="mr-1 w-4 h-4" />
                    Add Usage
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Material</th>
                        <th className="border p-2">Division</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsageInfo.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="border p-2 text-center text-gray-500">No usage entries available.</td>
                        </tr>
                      ) : (
                        allUsageInfo.map((usage) => (
                          <tr key={usage._id} className="text-center">
                            <td className="border p-2">{usage.material}</td>
                            <td className="border p-2">{usage.division}</td>
                            <td className="border p-2">{usage.quantity} {usage.unit}</td>
                            <td className="border p-2">{usage.description}</td>
                            <td className="border p-2">{new Date(usage.date).toLocaleDateString()}</td>
                            <td className="border p-2">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditUsage(usage)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUsage(usage.material, usage._id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'purchase' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Purchase Information</h4>
                  <button
                    onClick={() => {
                      setNewPurchase({ material: '', date: '', quantity: '', supplier: '', unitPrice: '', totalCost: '', deliveryNote: '', invoiceNumber: '' });
                      setEditingPurchaseId(null);
                      setShowPurchaseForm(true);
                    }}
                    className="text-white bg-blue-500 hover:bg-blue-600 py-1 px-3 rounded flex items-center"
                  >
                    <Plus className="mr-1 w-4 h-4" />
                    Add Purchase
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Material</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Supplier</th>
                        <th className="border p-2">Unit Price</th>
                        <th className="border p-2">Total Cost</th>
                        <th className="border p-2">Delivery Note</th>
                        <th className="border p-2">Invoice Number</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPurchaseInfo.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="border p-2 text-center text-gray-500">No purchase entries available.</td>
                        </tr>
                      ) : (
                        allPurchaseInfo.map((purchase) => (
                          <tr key={purchase._id} className="text-center">
                            <td className="border p-2">{purchase.material}</td>
                            <td className="border p-2">{new Date(purchase.date).toLocaleDateString()}</td>
                            <td className="border p-2">{purchase.quantity}</td>
                            <td className="border p-2">{purchase.supplier}</td>
                            <td className="border p-2">₱{purchase.unitPrice.toLocaleString()}</td>
                            <td className="border p-2">₱{purchase.totalCost.toLocaleString()}</td>
                            <td className="border p-2">{purchase.deliveryNote}</td>
                            <td className="border p-2">{purchase.invoiceNumber}</td>
                            <td className="border p-2">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditPurchase(purchase)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePurchase(purchase.material, purchase._id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Total Material Purchase Cost</h2>
                    <div className="text-xl font-bold text-green-600">
                      ₱{totalMaterialCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 border-t flex justify-end space-x-4">
            <button
              onClick={() => navigate(`/admin/projectsection/details/${id}`)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Back to Project
            </button>
          </div>
        </div>
      </div>

      {showUsageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingUsageId ? 'Edit Usage Entry' : 'Add New Usage Entry'}</h3>
              <button onClick={() => { setShowUsageForm(false); setEditingUsageId(null); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUsageSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                  <select
                    name="material"
                    value={newUsage.material}
                    onChange={handleUsageChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Material</option>
                    {defaultMaterials.map((material) => (
                      <option key={material.name} value={material.name}>{material.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <select
                    name="division"
                    value={newUsage.division}
                    onChange={handleUsageChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Division</option>
                    {project?.divisions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newUsage.quantity}
                    onChange={handleUsageChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={newUsage.unit}
                    onChange={handleUsageChange}
                    placeholder="bags, rods, etc."
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newUsage.date}
                    onChange={handleUsageChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newUsage.description}
                    onChange={handleUsageChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowUsageForm(false); setEditingUsageId(null); }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {editingUsageId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingPurchaseId ? 'Edit Purchase Entry' : 'Add New Purchase Entry'}</h3>
              <button onClick={() => { setShowPurchaseForm(false); setEditingPurchaseId(null); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handlePurchaseSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                  <select
                    name="material"
                    value={newPurchase.material}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Material</option>
                    {defaultMaterials.map((material) => (
                      <option key={material.name} value={material.name}>{material.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newPurchase.date}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newPurchase.quantity}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={newPurchase.supplier}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₱)</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={newPurchase.unitPrice}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₱)</label>
                  <input
                    type="number"
                    name="totalCost"
                    value={newPurchase.totalCost}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note</label>
                  <input
                    type="text"
                    name="deliveryNote"
                    value={newPurchase.deliveryNote}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={newPurchase.invoiceNumber}
                    onChange={handlePurchaseChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowPurchaseForm(false); setEditingPurchaseId(null); }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {editingPurchaseId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialTrack;