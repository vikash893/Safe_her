const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'WomenRequest', required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['women', 'volunteer', 'police', 'emergency'], required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['text', 'location', 'alert'], default: 'text' },
  locationData: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
