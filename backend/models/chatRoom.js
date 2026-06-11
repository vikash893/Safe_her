const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'WomenRequest', required: true, unique: true },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['women', 'volunteer', 'police', 'emergency'], required: true }
  }],
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
