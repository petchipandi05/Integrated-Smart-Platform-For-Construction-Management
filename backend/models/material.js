const mongoose = require('mongoose');

const materialUsageSchema = new mongoose.Schema({
  division: { type: String, required: true }, // e.g., "Floor"
  quantity: { type: Number, required: true, min: 0 }, // e.g., 50
  unit: { type: String, required: true }, // e.g., "bags"
  description: { type: String, required: true }, // e.g., "Used for foundation"
  date: { type: Date, required: true }, // e.g., "2024-01-20"
});

const materialPurchaseSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // e.g., "2024-01-15"
  quantity: { type: Number, required: true, min: 0 }, // e.g., 500
  supplier: { type: String, required: true }, // e.g., "BuildMaster Supplies"
  unitPrice: { type: Number, required: true, min: 0 }, // e.g., 250
  totalCost: { type: Number, required: true, min: 0 }, // e.g., 125000
  deliveryNote: { type: String, required: true }, // e.g., "DN-001"
  invoiceNumber: { type: String, required: true }, // e.g., "INV-001"
});

const materialSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  name: { type: String, required: true }, // e.g., "Cement"
  usageInfo: [materialUsageSchema], // List of usage records
  purchaseInfo: [materialPurchaseSchema], // List of purchase records
}, {
  timestamps: true,
});

module.exports = mongoose.model('Material', materialSchema);