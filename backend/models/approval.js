const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subjectType: { type: String, enum: ['volunteer', 'police', 'women'], required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  action: { type: String, enum: ['approved', 'rejected', 'suspended'], required: true },
  notes: { type: String, default: '' },
  performedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Approval', approvalSchema);
