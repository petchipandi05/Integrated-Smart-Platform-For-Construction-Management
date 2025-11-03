const mongoose = require('mongoose');

const laborSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  laborType: {
    type: String,
    required: true, // e.g., "Mason"
  },
  numberOfWorkers: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: Date,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
    min: 0, // Daily rate
  },
  description: {
    type: String,
    required: true,
  },
  totalWage: {
    type: Number,
    required: true,
    min: 0, // Calculated as rate * numberOfWorkers
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Labor', laborSchema);