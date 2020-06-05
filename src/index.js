const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { createUser, resetPassword, changeEmail } = require('./auth');

admin.initializeApp();

exports.createUser = functions.https.onCall(createUser);
exports.resetPassword = functions.https.onCall(resetPassword);
exports.changeEmail = functions.https.onCall(changeEmail);
