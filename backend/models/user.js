const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['Client', 'Admin'], default: 'Client' }, // Added role
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);