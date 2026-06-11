const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, enum: ['women', 'volunteer', 'police', 'admin'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['request', 'chat', 'emergency', 'assignment', 'system'], default: 'system' },
  relatedRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'WomenRequest' },
  relatedAlertId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyAlert' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
