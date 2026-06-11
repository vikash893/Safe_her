const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  womanId: { type: mongoose.Schema.Types.ObjectId, ref: 'women', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  relationship: { type: String, required: true },
  isPrimary: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
