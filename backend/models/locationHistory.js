const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'WomenRequest', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userRole: { type: String, enum: ['women', 'volunteer', 'police'], required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LocationHistory', locationHistorySchema);
