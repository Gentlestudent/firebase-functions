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

/**
 * Sends email to issuer when participant subscribes to learning opportunity
 * @param {{ to, opportunity: { title, id }, participant: { name, email } }} data Input data for the email
 * @param {string} data.to email address of the issuer
 * @param {string} data.opportunity.title title of the opportunity
 * @param {string} data.opportunity.id id of the opportunity
 * @param {string} data.participant.name name of the participant
 * @param {string} data.participant.email email address of the participant
 */
const sendNewParticipant = ({ to, opportunity: { title, id }, participant: { name, email } }) => {
  const content = `
    <p>Dag partner van Gentlestudent,</p>
    
    <p>Er heeft zich zopas iemand ingeschreven voor de leerkans: "${title}"</p>
  
    <p>De gegevens van deze persoon zijn: <br />
    - Naam: ${name}<br />
    - E-mailadres: ${email}</p>

    <p>Op <a href="https://gentlestudent.gent/opportunities/${id}">deze pagina</a> kan je jouw leerkans terugvinden,
    en indien je bent ingelogd kan je er de deelnemer accepteren. Zodra je de deelnemer accepteert,
    zal hij/zij een bevestigingsmail krijgen. Pas daarna kan de deelnemer met jou contact opnemen om verder af te stemmen.</p>
    
    <p>Met vriendelijke groet,</p>
    
    <p>Team Gentlestudent</p>`;

  sendMail({
    to,
    subject: `Inschrijving voor leerkans: ${title}`,
    text: '',
    html: content
  });
};

const sendBadgeClaimed = (to, displayName, participant) => {};

/**
 * Sends email to participant when issuer has approved them
 * @param {{ opportunity: { title }, participant: { participantName, participantEmail }, issuer: { issuerName, issuerEmail }}} data Input data for the email
 * @param {string} opportunity.title title of the opportunity
 * @param {string} participant.participantName name of the participant
 * @param {string} participant.participantEmail email of the participant (the email recipient)
 * @param {string} issuer.issuerEmail email address of the issuer
 * @param {string} issuer.issuerName name of the issuing organisation
 */
const sendAcceptedParticipation = ({
  opportunity: { title },
  participant: { participantName, participantEmail },
  issuer: { issuerName, issuerEmail }
}) => {
  const content = `
    <p>Dag ${participantName}</p>
   
    ${issuerName} heeft je registratie voor de leerkans "${title}" geaccepteerd. Je kan nu contact opnemen met de organisatie via mail.
    <p> - E-mailadres: ${issuerEmail} </p>
    
    <p>Veel succes!</p>
    <p>Team Gentlestudent</p>`;

  sendMail({
    to: participantEmail,
    subject: `Geaccepteerd voor leerkans: ${title}`,
    html: content
  });
};

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
