const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { createParticipant, resetPassword, changeEmail } = require('./auth');
const {
  createAssertion,
  getAssertion,
  createBadgeClass,
  getBadge,
  getIssuer
} = require('./badges');
const { nextjs } = require('./server');

admin.initializeApp();

exports.createParticipant = functions.https.onCall(createParticipant);
exports.resetPassword = functions.https.onCall(resetPassword);
exports.changeEmail = functions.https.onCall(changeEmail);
exports.createAssertion = functions.https.onCall(createAssertion);
exports.getAssertion = functions.https.onCall(getAssertion);
exports.createBadgeClass = functions.https.onCall(createBadgeClass);
exports.getBadge = functions.https.onCall(getBadge);
exports.getIssuer = functions.https.onCall(getIssuer);
exports.nextjs = { server: nextjs.server };
