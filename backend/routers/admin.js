const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const Women = require('../models/women');
const Volunteer = require('../models/volunteer');
const PoliceStation = require('../models/policeStation');
const WomenRequest = require('../models/womenRequest');
const { adminAuth } = require('../middleware/auth');

const adminRouter = express.Router();

// Admin Login
adminRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful', token, admin: { _id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard stats
adminRouter.get('/dashboard-stats', adminAuth, async (req, res) => {
  try {
    const totalWomen = await Women.countDocuments();
    const totalVolunteers = await Volunteer.countDocuments();
    const pendingVolunteers = await Volunteer.countDocuments({ status: 'pending' });
    const approvedVolunteers = await Volunteer.countDocuments({ status: 'approved' });
    const totalPolice = await PoliceStation.countDocuments();
    const pendingPolice = await PoliceStation.countDocuments({ status: 'pending' });
    const totalRequests = await WomenRequest.countDocuments();
    const activeRequests = await WomenRequest.countDocuments({ status: 'pending' });
    res.status(200).json({ totalWomen, totalVolunteers, pendingVolunteers, approvedVolunteers, totalPolice, pendingPolice, totalRequests, activeRequests });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all women
adminRouter.get('/women', adminAuth, async (req, res) => {
  try {
    const womenList = await Women.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ women: womenList });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete woman
adminRouter.delete('/women/:id', adminAuth, async (req, res) => {
  try {
    await Women.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all volunteers
adminRouter.get('/volunteers', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const volunteers = await Volunteer.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve volunteer
adminRouter.patch('/volunteers/:id/approve', adminAuth, async (req, res) => {
  try {
    const vol = await Volunteer.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!vol) return res.status(404).json({ error: 'Volunteer not found' });
    res.status(200).json({ message: 'Volunteer approved', volunteer: vol });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject volunteer
adminRouter.patch('/volunteers/:id/reject', adminAuth, async (req, res) => {
  try {
    const vol = await Volunteer.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!vol) return res.status(404).json({ error: 'Volunteer not found' });
    res.status(200).json({ message: 'Volunteer rejected', volunteer: vol });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete volunteer
adminRouter.delete('/volunteers/:id', adminAuth, async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Volunteer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all police stations
adminRouter.get('/police-stations', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const stations = await PoliceStation.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ policeStations: stations });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve police station
adminRouter.patch('/police-stations/:id/approve', adminAuth, async (req, res) => {
  try {
    const station = await PoliceStation.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!station) return res.status(404).json({ error: 'Police station not found' });
    res.status(200).json({ message: 'Police station approved', policeStation: station });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject police station
adminRouter.patch('/police-stations/:id/reject', adminAuth, async (req, res) => {
  try {
    const station = await PoliceStation.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!station) return res.status(404).json({ error: 'Police station not found' });
    res.status(200).json({ message: 'Police station rejected', policeStation: station });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete police station
adminRouter.delete('/police-stations/:id', adminAuth, async (req, res) => {
  try {
    await PoliceStation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Police station deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all requests
adminRouter.get('/requests', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await WomenRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = adminRouter;
