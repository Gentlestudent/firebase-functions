const admin = require('firebase-admin');
const functions = require('firebase-functions');

const buildIssuer = async ({ criteria, ...rest }) => {
  return {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'Issuer',
    ...rest
  };
};

exports.getIssuer = async ({ id }) => {
  try {
    const issuer = await admin.firestore().collection('Issuers').doc(id).get();
    if (!issuer.exists) throw new functions.https.HttpsError('not-found');

    const { name, email, institution, phonenumber, url } = issuer.data();

    return buildIssuer({
      name,
      email,
      url,
      description: `Institution: ${institution} - Email: ${email} - Phone: ${phonenumber}`,
      id: `${functions.config().frontend.url}api/issuers/${id}`
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
