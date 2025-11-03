const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  media: [{
    url: { type: String, required: true }, // URL to the uploaded file
    type: { type: String, enum: ['image', 'video'], required: true }, // Type of media
  }],
  description: {
    type: String,
    default: '',
  },
  dateUpdated: {
    type: Date,
    default: Date.now,
  },
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Link to the User model for authentication
    },
    sender: {
      text: { type: String, enum: ['Client', 'Admin'], required: true }, // Role for display
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  viewed: {
    type: Boolean,
    default: false, // Default to unviewed
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Progress', progressSchema);