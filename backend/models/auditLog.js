const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId },
  role: { type: String, enum: ['women', 'volunteer', 'police', 'admin', 'system'], required: true },
  action: { type: String, required: true },
  resourceType: { type: String, default: 'general' },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object, default: {} },
  ip: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
