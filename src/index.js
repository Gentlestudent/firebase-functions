const admin = require('firebase-admin');
const functions = require('firebase-functions');
const dotenv = require('dotenv');
const { createUser, resetPassword, changeEmail } = require('./auth');

dotenv.config();

admin.initializeApp();

exports.createUser = functions.auth.user().onCreate(createUser);
exports.resetPassword = functions.https.onCall(resetPassword);
exports.changeEmail = functions.https.onCall(changeEmail);
