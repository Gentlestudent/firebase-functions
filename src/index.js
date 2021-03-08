const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { createParticipant, resetPassword, changeEmail } = require('./auth');

admin.initializeApp();

exports.createParticipant = functions.https.onCall(createParticipant);
exports.resetPassword = functions.https.onCall(resetPassword);
exports.changeEmail = functions.https.onCall(changeEmail);
