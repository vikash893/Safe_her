const mongoose = require('mongoose');

const requestAssignmentSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'WomenRequest', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'volunteer', required: true },
  volunteerEmail: { type: String, required: true },
  status: { type: String, enum: ['assigned', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'assigned' },
  assignedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RequestAssignment', requestAssignmentSchema);
