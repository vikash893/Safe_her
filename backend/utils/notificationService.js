const Notification = require('../models/notification');
const { getMessaging, initializeFirebase } = require('./firebase');

const sendPushNotification = async ({ tokens, title, body, data = {} }) => {
  try {
    const messaging = getMessaging();
    if (!messaging || !Array.isArray(tokens) || tokens.length === 0) {
      return null;
    }

    const message = {
      notification: { title, body },
      data: Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: String(data[key]) }), {}),
      tokens
    };

    return await messaging.sendMulticast(message);
  } catch (error) {
    console.error('Push notification failed:', error);
    return null;
  }
};

const saveNotification = async ({ userId, role, title, body, type = 'system', relatedRequestId, relatedAlertId, data = {} }) => {
  const notification = new Notification({
    userId,
    role,
    title,
    body,
    type,
    relatedRequestId,
    relatedAlertId,
    data
  });
  return notification.save();
};

initializeFirebase();

module.exports = {
  sendPushNotification,
  saveNotification
};
