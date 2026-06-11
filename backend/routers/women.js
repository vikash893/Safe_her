const express = require('express');
const womenRouter = express.Router();
const upload = require('../utils/multer');
const women = require('../models/women');
const WomenRequest = require('../models/womenRequest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');
const { saveNotification } = require('../utils/notificationService');

// Register
womenRouter.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, phone, email, password, alternate_number, emergency_phone, emergency_email, pincode, lat, log, deviceToken } = req.body;
    const photo = req.file;
    if (!name || !phone || !email || !password || !alternate_number || !photo || !emergency_phone || !emergency_email || !pincode || !lat || !log) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const checkUser = await women.findOne({ email });
    if (checkUser) return res.status(406).json({ error: 'User already exists, please login' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newWomen = new women({
      name,
      phone,
      email,
      password: hashedPassword,
      alternate_number,
      photo: req.file.path,
      emergency_phone,
      emergency_email,
      pincode,
      lat: Number(lat),
      log: Number(log),
      deviceToken: deviceToken || ''
    });
    await newWomen.save();
    await logAudit({ userId: newWomen._id, role: 'women', action: 'register', resourceType: 'user', resourceId: newWomen._id, details: { email: newWomen.email, name: newWomen.name }, ip: req.ip, userAgent: req.headers['user-agent'] });
    await saveNotification({ userId: newWomen._id, role: 'women', title: 'Welcome', body: 'Your account has been created successfully.', type: 'system', relatedRequestId: null, relatedAlertId: null });
    const token = jwt.sign({ id: newWomen._id, name: newWomen.name, email: newWomen.email, role: 'women' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'User registered successfully', newWomen, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
womenRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
    const userExist = await women.findOne({ email });
    if (!userExist) return res.status(400).json({ error: 'User does not exist' });
    const isMatch = await bcrypt.compare(password, userExist.password);
    if (!isMatch) return res.status(400).json({ error: 'Wrong email or password' });
    await logAudit({ userId: userExist._id, role: 'women', action: 'login', resourceType: 'user', resourceId: userExist._id, details: { email: userExist.email }, ip: req.ip, userAgent: req.headers['user-agent'] });
    const token = jwt.sign({ id: userExist._id, name: userExist.name, email: userExist.email, role: 'women' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'User login successful', token, user: { _id: userExist._id, name: userExist.name, email: userExist.email, phone: userExist.phone, photo: userExist.photo, role: 'women' } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get me
womenRouter.get('/me', auth, async (req, res) => {
  try {
    const email = req.user.email;
    const woman = await women.findOne({ email });
    if (!woman) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({
      message: 'User',
      _id: woman._id,
      name: woman.name,
      email: woman.email,
      phone: woman.phone,
      alternate_number: woman.alternate_number,
      emergency_phone: woman.emergency_phone,
      emergency_email: woman.emergency_email,
      pincode: woman.pincode,
      lat: woman.lat,
      log: woman.log,
      imageUrl: `http://localhost:8000/${woman.photo.replace(/\\/g, '/')}`,
      role: 'women'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard
womenRouter.get('/dashboard', auth, async (req, res) => {
  try {
    const email = req.user.email;
    const woman = await women.findOne({ email });
    if (!woman) return res.status(404).json({ error: 'User not found' });
    const requests = await WomenRequest.find({ email }).sort({ createdAt: -1 });
    res.status(200).json({ user: woman, requests });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
womenRouter.put('/change-password/:email', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { email } = req.params;
    const user = await women.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Password doesn't match" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update device token for push notifications
womenRouter.put('/device-token', auth, async (req, res) => {
  try {
    const { deviceToken } = req.body;
    if (!deviceToken) return res.status(400).json({ error: 'Device token is required' });
    const updatedUser = await women.findOneAndUpdate({ email: req.user.email }, { deviceToken }, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    await logAudit({ userId: updatedUser._id, role: 'women', action: 'update_device_token', resourceType: 'user', resourceId: updatedUser._id, details: { deviceTokenSet: true }, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.status(200).json({ message: 'Device token updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = womenRouter;