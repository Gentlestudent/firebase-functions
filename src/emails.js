const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const FROM_ADDRESS = functions.config().mailer.email;

const transporter = nodemailer.createTransport({
  host: functions.config().mailer.host,
  secure: false,
  port: functions.config().mailer.port,
  tls: {
    ciphers: 'SSLv3'
  },
  auth: {
    user: functions.config().mailer.email,
    pass: functions.config().mailer.pass
  }
});

const sendMail = (mailOptions) => {
  transporter.sendMail(
    { from: `Gentlestudent <${FROM_ADDRESS}>`, ...mailOptions },
    (error, info) => {
      if (error) {
        throw error;
      }
      console.log('Message sent!', info);
    }
  );
};

const sendEmailVerification = (to, displayName, verificationLink) => {
  const content = `
    <p>Hallo ${displayName},</p>

    <p>Om aan de slag te gaan, gelieve jouw account te activeren via deze link:<br>
    <a href="${verificationLink}">${verificationLink}</a></p>

    <p>Als jij niet hebt gevraagd om dit adres te verifiëren, mag je deze mail negeren.</p>

    <p>Met vriendelijke groet,</p>
    
    <p>Team Gentlestudent</p>
  `;

  const mailOptions = {
    to,
    subject: 'Verifieer jouw Gentlestudent account',
    html: content
  };
  sendMail(mailOptions);
};

const sendPasswordResetEmail = () => {};

const sendEmailChangeConfirmation = () => {};

const sendNewOrg = (to, displayName) => {};

const sendNewParticipant = (to, displayName, participant) => {};

const sendBadgeClaimed = (to, displayName, participant) => {};

const sendAcceptedParticipation = (to, displayName, org) => {};

const sendRejectedParticipation = (to, displayName, org) => {};

const sendBadgeIssued = (to, displayName, org, assertion) => {};

module.exports = {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendEmailChangeConfirmation,
  sendBadgeClaimed,
  sendAcceptedParticipation,
  sendRejectedParticipation,
  sendBadgeIssued,
  sendNewOrg,
  sendNewParticipant
};
