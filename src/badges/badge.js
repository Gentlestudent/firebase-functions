const Joi = require('joi');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const schema = Joi.object({
  name: Joi.string().trim().min(1),
  description: Joi.string().trim().min(1),
  criteria: Joi.string().trim().min(1),
  issuerId: Joi.string().trim().min(1),
  image: Joi.string()
    .trim()
    .min(1)
    .uri({ domain: { minDomainSegments: 2 } })
});

const buildBadgeClass = async ({ criteria, ...rest }) => {
  return {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'BadgeClass',
    criteria: {
      narrative: criteria
    },
    ...rest
  };
};

exports.createBadgeClass = async (data, context) => {
  if (!context.auth) {
    // TODO check that this user is an admin
    throw new functions.https.HttpsError('unauthenticated');
  }

  const {
    error,
    params: { name, description, issuerId, criteria, image }
  } = schema.validate(data);

  if (error) throw new functions.https.HttpsError('invalid-argument');

  try {
    const issuer = await admin.firestore().collection('Issuers').doc(issuerId).get();

    if (!issuer.exists) throw new functions.https.HttpsError('invalid-argument');
    if (!issuer.data().validated) throw new functions.https.HttpsError('permission-denied');

    admin
      .firestore()
      .collection('Badges')
      .doc()
      .set({ name, description, issuerId, criteria, image });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.getBadge = async ({ id }) => {
  try {
    let badge = await admin.firestore().collection('Badges').doc(id).get();
    if (!badge.exists) throw new functions.https.HttpsError('not-found');

    badge = badge.data();
    delete badge.badgeId;

    return buildBadgeClass({
      ...badge,
      id: `${functions.config().frontend.url}api/badges/${id}`,
      issuer: `${functions.config().frontend.url}api/issuers/gentlestudent`
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
