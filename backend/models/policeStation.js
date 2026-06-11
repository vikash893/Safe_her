const mongoose = require('mongoose');

const policeStationSchema = new mongoose.Schema({
  stationName: { type: String, required: true },
  officerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  deviceToken: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  role: { type: String, default: 'police' }
}, { timestamps: true });

module.exports = mongoose.model('PoliceStation', policeStationSchema);
