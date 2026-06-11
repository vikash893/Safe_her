const express = require('express');
const bcrypt = require('bcrypt');
const volunteer = require('../models/volunteer');
const womenRequest = require('../models/womenRequest');
const EmergencyAlert = require('../models/emergencyAlert');
const upload = require('../utils/multer');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

const volunteerRouter = express.Router();

// Register (status starts as pending)
volunteerRouter.post('/register', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'aadharPhoto', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, phone, email, password, alternate_number, pincode, lat, log, aadhar_number } = req.body;
    const photo = req.files?.photo?.[0];
    const aadharPhoto = req.files?.aadharPhoto?.[0];
    if (!name || !phone || !email || !password || !alternate_number || !pincode || lat === undefined || log === undefined || !aadhar_number || !photo || !aadharPhoto) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingVolunteer = await volunteer.findOne({ $or: [{ email }, { phone }, { aadhar_number }] });
    if (existingVolunteer) return res.status(409).json({ error: 'Volunteer already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newVolunteer = new volunteer({ name, phone, email, password: hashedPassword, alternate_number, photo: photo.path, pincode, lat: Number(lat), log: Number(log), aadhar_number, aadharPhoto: aadharPhoto.path, status: 'pending' });
    await newVolunteer.save();
    res.status(201).json({ message: 'Registration submitted! Waiting for admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login (only approved volunteers)
volunteerRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const volunteerData = await volunteer.findOne({ email });
    if (!volunteerData) return res.status(404).json({ error: 'Volunteer not found' });
    if (volunteerData.status === 'pending') return res.status(403).json({ error: 'Your registration is pending admin approval. Please wait.' });
    if (volunteerData.status === 'rejected') return res.status(403).json({ error: 'Your registration has been rejected by admin.' });
    const isMatch = await bcrypt.compare(password, volunteerData.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: volunteerData._id, name: volunteerData.name, email: volunteerData.email, role: 'volunteer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful', volunteer: { _id: volunteerData._id, name: volunteerData.name, email: volunteerData.email, phone: volunteerData.phone, photo: volunteerData.photo, role: 'volunteer' }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token
volunteerRouter.get('/verify', auth, async (req, res) => {
  try {
    const volunteerData = await volunteer.findOne({ email: req.user.email });
    if (!volunteerData) return res.status(404).json({ valid: false });
    res.status(200).json({ valid: true, user: { _id: volunteerData._id, name: volunteerData.name, email: volunteerData.email, phone: volunteerData.phone, role: 'volunteer' } });
  } catch (error) {
    res.status(500).json({ valid: false });
  }
});

// Get active emergency alerts for volunteers
volunteerRouter.get('/emergency-alerts', auth, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'active' }).sort({ createdAt: -1 });
    const transformed = alerts.map((alert) => ({
      _id: alert._id,
      womenName: alert.womenName,
      womenPhone: alert.womenPhone,
      locationLink: `https://maps.google.com/?q=${alert.lat},${alert.lng}`,
      createdAt: alert.createdAt,
      acknowledgedBy: alert.acknowledgedBy || [],
      alreadyAcknowledged: alert.acknowledgedBy.some((entry) => String(entry.id) === String(req.user.id))
    }));
    res.status(200).json({ count: transformed.length, alerts: transformed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get emergency alerts this volunteer has responded to
volunteerRouter.get('/my-emergency-responses', auth, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ 'acknowledgedBy.id': String(req.user.id) }).sort({ createdAt: -1 });
    const transformed = alerts.map((alert) => ({
      _id: alert._id,
      womenName: alert.womenName,
      womenPhone: alert.womenPhone,
      locationLink: `https://maps.google.com/?q=${alert.lat},${alert.lng}`,
      createdAt: alert.createdAt,
      status: alert.status,
      acknowledgedAt: alert.acknowledgedBy.find((entry) => String(entry.id) === String(req.user.id))?.acknowledgedAt || null
    }));
    res.status(200).json({ count: transformed.length, alerts: transformed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all pending requests
volunteerRouter.get('/pending-request', auth, async (req, res) => {
  try {
    const requests = await womenRequest.find({ status: 'pending', acceptedBy: null }).sort({ createdAt: -1 });
    res.status(200).json({ count: requests.length, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my accepted requests
volunteerRouter.get('/my-accepted-requests', auth, async (req, res) => {
  try {
    const requests = await womenRequest.find({ acceptedBy: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get volunteer request history (accepted / rejected / completed)
volunteerRouter.get('/history', auth, async (req, res) => {
  try {
    const requests = await womenRequest.find({
      $or: [
        { acceptedBy: req.user.email },
        { 'history.performedBy': req.user.email }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ count: requests.length, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept or reject request
volunteerRouter.patch('/request/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const volunteerEmail = req.user.email;
    if (!action) return res.status(400).json({ error: 'Action is required' });
    if (!['accepted', 'rejected'].includes(action)) return res.status(400).json({ error: 'Action must be accepted or rejected' });
    const volunteerData = await volunteer.findOne({ email: volunteerEmail });
    if (!volunteerData) return res.status(404).json({ error: 'Volunteer not found' });

    if (action === 'accepted') {
      const request = await womenRequest.findOneAndUpdate(
        { _id: requestId, status: 'pending', acceptedBy: null },
        {
          status: 'accepted',
          acceptedBy: volunteerEmail,
          acceptedVolunteerId: volunteerData._id,
          $push: {
            history: {
              action: 'accepted',
              performedBy: volunteerEmail,
              performedByRole: 'volunteer',
              comments: `Request accepted by ${volunteerData.name}`
            }
          }
        },
        { new: true }
      );
      if (!request) return res.status(400).json({ error: 'Request is no longer available for acceptance' });

      const io = req.app.get('io');
      if (io) {
        io.to(`request-${requestId}`).emit('request-accepted', {
          requestId,
          volunteer: { email: volunteerEmail, name: volunteerData.name }
        });
      }

      res.status(200).json({ message: 'Request accepted successfully', request });
    } else {
      const request = await womenRequest.findById(requestId);
      if (!request) return res.status(404).json({ error: 'Request not found' });
      if (request.acceptedBy !== volunteerEmail) return res.status(403).json({ error: 'You can only reject your own accepted request' });
      request.status = 'pending';
      request.acceptedBy = null;
      request.acceptedVolunteerId = null;
      request.history.push({
        action: 'rejected',
        performedBy: volunteerEmail,
        performedByRole: 'volunteer',
        comments: `Request rejected by ${volunteerData.name}`
      });
      await request.save();
      res.status(200).json({ message: 'Request rejection recorded, it is pending again', request });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete request
volunteerRouter.patch('/complete-request/:requestId', auth, async (req, res) => {
  try {
    const request = await womenRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.acceptedBy !== req.user.email) return res.status(403).json({ error: 'Not authorized' });
    request.work_status = 'complete';
    request.status = 'completed';
    request.history.push({
      action: 'completed',
      performedBy: req.user.email,
      performedByRole: 'volunteer',
      comments: `Request completed by volunteer ${req.user.email}`
    });
    await request.save();
    res.status(200).json({ message: 'Request completed', request });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = volunteerRouter;