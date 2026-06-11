const express = require('express');
const women = require('../models/women');
const womenRequest = require('../models/womenRequest');
const PoliceStation = require('../models/policeStation');
const { auth } = require('../middleware/auth');

const womenRequestRouter = express.Router();

// Send request
womenRequestRouter.post('/send-request', auth, async (req, res) => {
  try {
    const { email, description, type, lat, lng } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const checkWomen = await women.findOne({ email });
    if (!checkWomen) return res.status(404).json({ error: 'User not found' });
    const existingRequest = await womenRequest.findOne({ email, status: 'pending' });
    if (existingRequest) return res.status(400).json({ error: 'You already have a pending request' });
    
    const newRequest = new womenRequest({
      email,
      womenId: checkWomen._id,
      womenName: checkWomen.name,
      womenPhone: checkWomen.phone,
      description: description || '',
      type: type || 'normal',
      lat: lat || checkWomen.lat,
      lng: lng || checkWomen.log,
      history: [{
        action: 'created',
        performedBy: checkWomen.email,
        performedByRole: 'women',
        comments: 'Request created by the user.'
      }]
    });

    // If feel_unsafe, find nearest police station
    if (type === 'feel_unsafe') {
      const nearbyPolice = await PoliceStation.findOne({ status: 'approved', pincode: checkWomen.pincode });
      if (nearbyPolice) {
        newRequest.policeStationId = nearbyPolice._id;
      }
    }

    await newRequest.save();
    res.status(200).json({ message: 'Request sent successfully', request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my requests
womenRequestRouter.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await womenRequest.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single request
womenRequestRouter.get('/:id', auth, async (req, res) => {
  try {
    const request = await womenRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.status(200).json({ request });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit feedback for a completed request
womenRequestRouter.patch('/feedback/:requestId', auth, async (req, res) => {
  try {
    const { volunteerFeedback, volunteerRating, policeFeedback, policeRating } = req.body;
    const request = await womenRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.email !== req.user.email) return res.status(403).json({ error: 'Unauthorized' });
    if (request.status !== 'completed') return res.status(400).json({ error: 'Feedback can only be submitted for completed cases' });

    request.volunteerFeedback = volunteerFeedback ?? request.volunteerFeedback;
    request.volunteerRating = volunteerRating ?? request.volunteerRating;
    if (request.type !== 'normal') {
      request.policeFeedback = policeFeedback ?? request.policeFeedback;
      request.policeRating = policeRating ?? request.policeRating;
    }
    request.feedbackSubmitted = true;
    request.history.push({
      action: 'feedback_submitted',
      performedBy: req.user.email,
      performedByRole: 'women',
      comments: 'Feedback submitted for completed request.'
    });

    await request.save();
    res.status(200).json({ message: 'Feedback submitted successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = womenRequestRouter;