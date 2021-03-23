const Joi = require('joi');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const saltedHash = require('../utils/hash');

const TYPES = {
  learningOpportunity: 0,
  quest: 1
};

const schema = Joi.object({
  receiverId: Joi.string().trim().min(1),
  opportunityId: Joi.string().trim().min(1),
  feat: Joi.object()
    .keys({
      type: Joi.number()
        .allow(TYPES.learningOpportunity, TYPES.quest)
        .default(TYPES.learningOpportunity)
        .required(),
      evidence: Joi.string().min(1)
    })
    .required()
});

const buildAssertion = async ({
  receiverId,
  issuedOn,
  feat,
  issuer: { institute, website },
  ...rest
}) => {
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
    evidence: {
      id: `${functions.config().frontend.url}/${
        feat.type === TYPES.learningOpportunity ? 'opportunities' : 'quests'
      }/${feat.evidence}`,
      narrative: `Awarded for completing a ${
        feat.type === TYPES.learningOpportunity
          ? `learning opportunity provided by ${institute}${
              website ? `. More on us: ${website}` : ''
            }`
          : 'quest'
      }.`
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
    params: { receiverId, opportunityId, feat }
  } = schema.validate(data);

  if (error) throw new functions.https.HttpsError('invalid-argument');

  try {
    const participant = await admin.firestore().collection('Participants').doc(receiverId).get();
    const opportunity = await admin
      .firestore()
      .collection('Opportunities')
      .doc(opportunityId)
      .get();

    if (
      !participant.exists ||
      !opportunity.exists ||
      !(
        await admin
          .firestore()
          .collection(feat.type === TYPES.learningOpportunity ? 'Opportunities' : 'Quests')
          .doc(feat.evidence)
          .get()
      ).exists
    ) {
      throw new functions.https.HttpsError('invalid-argument');
    }

    if (opportunity.data().issuerId !== context.auth.uid)
      throw new functions.https.HttpsError('permission-denied');

    admin
      .firestore()
      .collection('Assertions')
      .doc()
      .set({ receiverId, opportunityId, issuedOn: new Date(), feat });
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
    const { opportunityId, feat } = assertion;
    delete assertion.opportunityId;

    let issuer;

    if (feat.type === TYPES.learningOpportunity) {
      const opportunity = (
        await admin.firestore().collection('Opportunities').doc(opportunityId).get()
      ).data();

      issuer = (
        await admin.firestore().collection('Issuers').doc(opportunity.issuerId).get()
      ).data();
    }

    return buildAssertion({
      ...assertion,
      issuer,
      id: `${functions.config().frontend.url}api/assertions/${id}`,
      badge: `${functions.config().frontend.url}api/badges/${opportunityId}`
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
