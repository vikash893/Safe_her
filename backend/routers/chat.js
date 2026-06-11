const express = require('express');
const ChatMessage = require('../models/chatMessage');
const { auth } = require('../middleware/auth');

const chatRouter = express.Router();

// Get chat messages for a request
chatRouter.get('/:requestId/messages', auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ requestId: req.params.requestId }).sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message (REST fallback)
chatRouter.post('/:requestId/message', auth, async (req, res) => {
  try {
    const { message, senderName, senderRole, type, locationData } = req.body;
    const newMessage = new ChatMessage({
      requestId: req.params.requestId,
      senderId: req.user.id || req.user._id,
      senderName: senderName || req.user.name,
      senderRole: senderRole || req.user.role,
      message,
      type: type || 'text',
      locationData
    });
    await newMessage.save();
    const io = req.app.get('io');
    if (io) io.to(`request-${req.params.requestId}`).emit('new-message', newMessage);
    res.status(200).json({ message: 'Message sent', chatMessage: newMessage });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = chatRouter;
