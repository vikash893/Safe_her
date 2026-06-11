const mongoose = require('mongoose');

const requestHistorySchema = new mongoose.Schema({
  action: { type: String, enum: ['created', 'accepted', 'rejected', 'completed', 'feedback_submitted'], required: true },
  performedBy: { type: String, required: true },
  performedByRole: { type: String, enum: ['women', 'volunteer', 'police'], required: true },
  comments: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const womenRequestSchema = new mongoose.Schema({
  email: { type: String, required: true },
  womenId: { type: mongoose.Schema.Types.ObjectId, ref: 'women' },
  womenName: { type: String },
  womenPhone: { type: String },
  description: { type: String, default: '' },
  type: { type: String, enum: ['normal', 'emergency', 'feel_unsafe'], default: 'normal' },
  lat: { type: Number },
  lng: { type: Number },
  acceptedBy: { type: String, default: null },
  acceptedVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'volunteer', default: null },
  policeStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation', default: null },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  work_status: { type: String, enum: ['incomplete', 'complete'], default: 'incomplete' },
  volunteerFeedback: { type: String, default: '' },
  volunteerRating: { type: Number, min: 1, max: 5 },
  policeFeedback: { type: String, default: '' },
  policeRating: { type: Number, min: 1, max: 5 },
  feedbackSubmitted: { type: Boolean, default: false },
  history: { type: [requestHistorySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('WomenRequest', womenRequestSchema);