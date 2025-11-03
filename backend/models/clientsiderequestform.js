
const mongoose = require('mongoose');

const clientsiderequestformSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNo: String, // Add this field
  projectType: String,
  message: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('clientrequestform',clientsiderequestformSchema );