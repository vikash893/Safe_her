const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  womenId: { type: mongoose.Schema.Types.ObjectId, ref: 'women', required: true },
  womenEmail: { type: String, required: true },
  womenName: { type: String, required: true },
  womenPhone: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  notifiedVolunteers: [{ type: String }],
  notifiedPolice: [{ type: String }],
  emergencyContactEmail: { type: String },
  emergencyContactPhone: { type: String },
  acknowledgedBy: [{
    id: String,
    role: String,
    name: String,
    acknowledgedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
