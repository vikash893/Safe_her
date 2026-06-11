const admin = require('firebase-admin');

let appInstance = null;

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    appInstance = admin.app();
    return appInstance;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : null;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccount && !serviceAccountPath) {
    console.warn('Firebase service account is not configured. Push notifications will be disabled.');
    return null;
  }

  const credentials = serviceAccount || require(serviceAccountPath);

  appInstance = admin.initializeApp({
    credential: admin.credential.cert(credentials)
  });

  return appInstance;
};

const getMessaging = () => {
  if (!appInstance) initializeFirebase();
  return appInstance ? admin.messaging() : null;
};

module.exports = { initializeFirebase, getMessaging };
