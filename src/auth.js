const admin = require('firebase-admin');
const functions = require('firebase-functions');
const emails = require('./emails');

const sendAccountVerificationEmail = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }

  const auth = admin.auth();

  let user;
  try {
    user = await auth.getUser(context.auth.uid);
  } catch (ex) {
    console.log(ex);
    throw new functions.https.HttpsError('permission-denied');
  }

  if (!user || user.emailVerified) throw new functions.https.HttpsError('permission-denied');

  const link = await auth.generateEmailVerificationLink(user.email);

  try {
    await emails.sendEmailVerification(user.email, user.displayName, link);
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw new functions.https.HttpsError('unknown');
  }
};

exports.createParticipant = async ({ email, name, institute }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }

  // TODO args validation
  const participantsCollection = admin.firestore().collection('Participants');
  try {
    const existingParticipant = await participantsCollection.doc(context.auth.uid).get();

    if (existingParticipant.exists) throw new functions.https.HttpsError('already-exists');

    await participantsCollection.doc(context.auth.uid).set({ name, email, institute });

    await sendAccountVerificationEmail(null, context);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.resetPassword = async () => {};

exports.changeEmail = async () => {};
