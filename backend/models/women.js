const mongoose = require('mongoose');

const womenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  alternate_number: { type: String, required: true },
  photo: { type: String, required: true },
  emergency_phone: { type: String, required: true },
  emergency_email: { type: String, required: true },
  pincode: { type: String, required: true },
  lat: { type: Number, required: true },
  log: { type: Number, required: true },
  deviceToken: { type: String, default: '' },
  role: { type: String, default: 'women' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('women', womenSchema);