const Joi = require('joi');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const schema = Joi.object({
  name: Joi.string().trim().min(1),
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
    params: { name, image }
  } = schema.validate(data);

  if (error) throw new functions.https.HttpsError('invalid-argument');

  try {
    admin.firestore().collection('Badges').doc().set({ name, image });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.getBadge = async ({ id }) => {
  try {
    const opportunity = await admin.firestore().collection('Opportunities').doc(id).get();
    if (!opportunity.exists) throw new functions.https.HttpsError('not-found');

    let badge = await admin.firestore().collection('Badges').doc(opportunity.id).get();

    badge = badge.data();
    delete badge.badgeId;

    return buildBadgeClass({
      ...badge,
      id: `${functions.config().frontend.url}api/badges/${badge.id}`,
      issuer: `${functions.config().frontend.url}api/issuers/gentlestudent`,
      criteria: opportunity.shortDescription,
      description: opportunity.longDescription
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
