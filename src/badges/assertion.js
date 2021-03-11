const Joi = require('joi');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const saltedHash = require('../utils/hash');

const schema = Joi.object({
  receiverId: Joi.string().trim().min(1),
  badgeId: Joi.string().trim().min(1)
});

const buildAssertion = async ({ receiverId, issuedOn, ...rest }) => {
  const receiver = (
    await admin.firestore().collection('Participants').doc(receiverId).get()
  ).data();
  const { hash: identity, salt } = saltedHash(receiver.email);

  return {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'Assertion',
    issuedOn,
    recipient: {
      hashed: true,
      type: 'email',
      identity,
      salt
    },
    verification: { type: 'HostedBadge' },
    ...rest
  };
};

exports.createAssertion = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }

  const {
    error,
    params: { receiverId, badgeId }
  } = schema.validate(data);

  if (error) throw new functions.https.HttpsError('invalid-argument');

  try {
    const participant = await admin.firestore().collection('Participants').doc(receiverId).get();
    const badge = await admin.firestore().collection('Badges').doc(badgeId).get();

    if (!participant.exists || !badge.exists)
      throw new functions.https.HttpsError('invalid-argument');

    if (badge.data().issuerId !== context.auth.uid)
      throw new functions.https.HttpsError('permission-denied');

    admin
      .firestore()
      .collection('Assertions')
      .doc()
      .set({ receiverId, badgeId, issuedOn: new Date() });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Retrieves an assertion.
 */
exports.getAssertion = async ({ id }) => {
  try {
    let assertion = await admin.firestore().collection('Assertions').doc(id).get();
    if (!assertion.exists) throw new functions.https.HttpsError('not-found');

    assertion = assertion.data();
    const { badgeId } = assertion;
    delete assertion.badgeId;

    return buildAssertion({
      ...assertion,
      id: `${functions.config().frontend.url}api/assertions/${id}`,
      badge: `${functions.config().frontend.url}api/badges/${badgeId}`
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
