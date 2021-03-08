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
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw error;
    }
    console.log('Message sent!', info);
  });
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
    from: `Gentlestudent <${FROM_ADDRESS}>`,
    to,
    subject: 'Verifieer jouw Gentlestudent account',
    html: content
  };
  sendMail(mailOptions);
};

const sendPasswordResetEmail = () => {};

const sendEmailChangeConfirmation = () => {};

module.exports = {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendEmailChangeConfirmation
};
