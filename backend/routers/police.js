const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PoliceStation = require('../models/policeStation');
const EmergencyAlert = require('../models/emergencyAlert');
const WomenRequest = require('../models/womenRequest');
const { auth, policeAuth } = require('../middleware/auth');

const policeRouter = express.Router();

// Register
policeRouter.post('/register', async (req, res) => {
  try {
    const { stationName, officerName, email, password, phone, address, pincode, lat, lng } = req.body;
    if (!stationName || !officerName || !email || !password || !phone || !address || !pincode || !lat || !lng) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existing = await PoliceStation.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Police station already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const station = new PoliceStation({ stationName, officerName, email, password: hashedPassword, phone, address, pincode, lat: Number(lat), lng: Number(lng), status: 'pending' });
    await station.save();
    res.status(201).json({ message: 'Registration submitted! Waiting for admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
policeRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });
    const station = await PoliceStation.findOne({ email });
    if (!station) return res.status(404).json({ error: 'Police station not found' });
    if (station.status === 'pending') return res.status(403).json({ error: 'Registration pending admin approval.' });
    if (station.status === 'rejected') return res.status(403).json({ error: 'Registration rejected by admin.' });
    const isMatch = await bcrypt.compare(password, station.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: station._id, email: station.email, stationName: station.stationName, role: 'police' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful', token, station: { _id: station._id, stationName: station.stationName, email: station.email, phone: station.phone, role: 'police' } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active alerts
policeRouter.get('/active-alerts', policeAuth, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feel_unsafe or emergency requests assigned to this station
policeRouter.get('/assigned-requests', policeAuth, async (req, res) => {
  try {
    const station = await PoliceStation.findOne({ email: req.user.email });
    const requests = await WomenRequest.find({ policeStationId: station._id, type: { $in: ['feel_unsafe', 'emergency'] } }).sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Acknowledge alert
policeRouter.patch('/acknowledge/:alertId', policeAuth, async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.alertId);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    const alreadyAcked = alert.acknowledgedBy.find(a => a.id === req.user.id && a.role === 'police');
    if (!alreadyAcked) {
      alert.acknowledgedBy.push({ id: req.user.id, role: 'police', name: req.user.stationName });
      await alert.save();
    }
    res.status(200).json({ message: 'Alert acknowledged', alert });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = policeRouter;
