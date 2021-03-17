const functions = require('firebase-functions');

const buildIssuer = async ({ criteria, ...rest }) => {
  return {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'Issuer',
    ...rest
  };
};

exports.getIssuer = async () => {
  try {
    return buildIssuer({
      name: 'Gentlestudent',
      email: functions.config().mailer.email,
      url: functions.config().frontend.url,
      id: `${functions.config().frontend.url}api/issuers/gentlestudent`
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
