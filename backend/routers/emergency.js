const express = require('express');
const axios = require('axios');
const Women = require('../models/women');
const Volunteer = require('../models/volunteer');
const PoliceStation = require('../models/policeStation');
const WomenRequest = require('../models/womenRequest');
const EmergencyAlert = require('../models/emergencyAlert');
const { auth } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');
const { saveNotification, sendPushNotification } = require('../utils/notificationService');

const emergencyRouter = express.Router();

// Emergency Alert - the main emergency button
emergencyRouter.post('/alert', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const woman = await Women.findOne({ email: req.user.email });
    if (!woman) return res.status(404).json({ error: 'User not found' });

    const alertLat = lat || woman.lat;
    const alertLng = lng || woman.log;

    // Find nearby volunteers (same pincode or all approved)
    const nearbyVolunteers = await Volunteer.find({ status: 'approved' }).select('email name phone deviceToken');
    const volunteerEmails = nearbyVolunteers.map(v => v.email);

    // Find nearby police stations
    const nearbyPolice = await PoliceStation.find({ status: 'approved' }).select('email stationName phone deviceToken');
    const policeEmails = nearbyPolice.map(p => p.email);

    // Create an emergency request so responders can access chat and response details
    const emergencyRequest = new WomenRequest({
      email: woman.email,
      womenId: woman._id,
      womenName: woman.name,
      womenPhone: woman.phone,
      description: `Emergency alert triggered by ${woman.name}.`,
      type: 'emergency',
      lat: alertLat,
      lng: alertLng
    });
    if (nearbyPolice.length > 0) {
      emergencyRequest.policeStationId = nearbyPolice[0]._id;
    }
    await emergencyRequest.save();

    // Create alert record
    const alert = new EmergencyAlert({
      womenId: woman._id,
      womenEmail: woman.email,
      womenName: woman.name,
      womenPhone: woman.phone,
      lat: alertLat,
      lng: alertLng,
      notifiedVolunteers: volunteerEmails,
      notifiedPolice: policeEmails,
      emergencyContactEmail: woman.emergency_email,
      emergencyContactPhone: woman.emergency_phone
    });
    await alert.save();

    await logAudit({
      userId: woman._id,
      role: 'women',
      action: 'emergency_alert',
      resourceType: 'emergency',
      resourceId: alert._id,
      details: { lat: alertLat, lng: alertLng, volunteerEmails, policeEmails },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    await saveNotification({
      userId: woman._id,
      role: 'women',
      title: 'Emergency alert sent',
      body: 'Your emergency alert has been registered and responders have been notified.',
      type: 'emergency',
      relatedAlertId: alert._id,
      data: { requestType: 'emergency' }
    });

    const volunteerTokens = nearbyVolunteers.filter(v => v.deviceToken).map(v => v.deviceToken);
    const policeTokens = nearbyPolice.filter(p => p.deviceToken).map(p => p.deviceToken);
    const responderTokens = [...new Set([...volunteerTokens, ...policeTokens])];

    if (responderTokens.length > 0) {
      await sendPushNotification({
        tokens: responderTokens,
        title: 'Emergency alert nearby',
        body: `${woman.name} triggered an emergency alert. Open the app to respond immediately.`,
        data: { alertId: String(alert._id), type: 'emergency' }
      });
    }

    const responderNotificationPromises = [];
    nearbyVolunteers.forEach((volunteer) => {
      if (volunteer._id) {
        responderNotificationPromises.push(saveNotification({
          userId: volunteer._id,
          role: 'volunteer',
          title: 'Emergency ready to respond',
          body: `Emergency alert raised by ${woman.name}. Please check the app.`,
          type: 'emergency',
          relatedAlertId: alert._id,
          data: { womanEmail: woman.email }
        }));
      }
    });
    nearbyPolice.forEach((police) => {
      if (police._id) {
        responderNotificationPromises.push(saveNotification({
          userId: police._id,
          role: 'police',
          title: 'Emergency alert assigned',
          body: `Emergency alert raised by ${woman.name}. Please respond promptly.`,
          type: 'emergency',
          relatedAlertId: alert._id,
          data: { womanEmail: woman.email }
        }));
      }
    });

    await Promise.allSettled(responderNotificationPromises);

    // Send n8n webhook for Gmail notifications
    try {
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        alertId: alert._id,
        womanName: woman.name,
        womanPhone: woman.phone,
        womanEmail: woman.email,
        location: { lat: alertLat, lng: alertLng },
        locationLink: `https://maps.google.com/?q=${alertLat},${alertLng}`,
        emergencyContactEmail: woman.emergency_email,
        emergencyContactPhone: woman.emergency_phone,
        volunteerEmails,
        policeEmails,
        timestamp: new Date().toISOString(),
        message: `EMERGENCY ALERT: ${woman.name} needs immediate help! Location: https://maps.google.com/?q=${alertLat},${alertLng}`
      });
      console.log('n8n webhook sent successfully');
    } catch (webhookError) {
      console.error('n8n webhook failed (continuing):', webhookError.message);
    }

    // Emit Socket.IO event for buzzer (will be done via the io instance passed to router)
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency-buzzer', {
        alertId: alert._id,
        womanName: woman.name,
        womanPhone: woman.phone,
        lat: alertLat,
        lng: alertLng,
        locationLink: `https://maps.google.com/?q=${alertLat},${alertLng}`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({ message: 'Emergency alert sent!', alert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Acknowledge alert
emergencyRouter.patch('/alert/:id/acknowledge', auth, async (req, res) => {
  try {
    const { name, role } = req.body;
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    const alreadyAcked = alert.acknowledgedBy.find(a => a.id === (req.user.id || req.user._id));
    if (!alreadyAcked) {
      alert.acknowledgedBy.push({ id: req.user.id || req.user._id, role: role || req.user.role, name: name || req.user.name });
      await alert.save();
    }
    res.status(200).json({ message: 'Alert acknowledged', alert });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve alert
emergencyRouter.patch('/alert/:id/resolve', auth, async (req, res) => {
  try {
    const alert = await EmergencyAlert.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    const io = req.app.get('io');
    if (io) io.emit('alert-resolved', { alertId: alert._id });
    res.status(200).json({ message: 'Alert resolved', alert });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active alerts
emergencyRouter.get('/active-alerts', auth, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = emergencyRouter;
