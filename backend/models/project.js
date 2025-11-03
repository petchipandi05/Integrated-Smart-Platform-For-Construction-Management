const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  location: { type: String, required: true },
  cost: { type: String, required: true }, // Original estimated cost (kept as string per your schema)
  startingDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  totalLandArea: { type: String, required: true },
  typeOfConstruction: { type: String, required: true },
  divisions: [{ type: String }], // e.g., ["Floor", "Roof"]
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  imageUrl: { type: String },
  status: { 
    type: String, 
    enum: ['ongoing', 'finished'], 
    default: 'ongoing' 
  },
  progressUpdates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Progress',
  }],
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
  }],
  laborRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Labor',
  }],
  totalLaborCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0, // Total labor cost for the project (sum of all Labor.totalWage)
  },
  totalMaterialCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0, // Total material cost for the project (sum of all Material.purchaseInfo.totalCost)
  },
  grandProjectCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0, // Total project cost (totalLaborCost + totalMaterialCost)
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);