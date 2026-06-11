const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, enum: ['women', 'volunteer', 'police', 'admin'], required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
