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

/**
 * Sends email to admin when an organisation registers.
 * @param {{ org: { name } }} data Input data for the email
 * @param {string} data.org.name name of the organisation
 */
const sendNewOrg = ({ org: { name } }) => {
  // TODO update link
  const content = `
  <p>Beste Gentlestudent Admin</p> 

  <p>${name} heeft zich zonet geregistreerd als issuer op Gentlestudent.
  Gelieve deze registratie na te kijken, contact op te nemen met de organisatie indien dat nodig zou zijn om vervolgens de registratie al dan niet te accepteren.</p>
  
  <p>De registratie bekijken kan rechtstreeks via <a href="https://gentlestudent.gent/dashboard">deze link</a>.</p>
  
  <p>Met vriendelijke groet<br />
  Gentlestudent.gent</p>`;

  sendMail({
    to: functions.config().mailer.email,
    subject: ``,
    html: content
  });
};

/**
 * Sends email to issuer when participant subscribes to learning opportunity
 * @param {{ issuer: { email, orgName }, opportunity: { title, id } }} data Input data for the email
 * @param {string} data.issuer.issuerEmail email address of the issuer
 * @param {string} data.issuer.orgName organisation name of the issuer
 * @param {string} data.opportunity.title title of the opportunity
 * @param {string} data.opportunity.id id of the opportunity
 */
const sendNewParticipant = ({ issuer: { issuerEmail, orgName }, opportunity: { title, id } }) => {
  const content = `
  <p>Beste contactpersoon bij ${orgName}

  <p>Een student heeft zich zonet geregistreerd om met "${title}" aan de slag te gaan. 
  Je kan deze registratie nakijken via <a href="https://gentlestudent.gent/opportunities/${id}">deze rechtstreekse link</a> (vergeet niet om je in te loggen op het platform). 
  Vervolgens kan je de registratie accepteren of weigeren.</p>
  
  <p>Indien je ervoor kiest om de registratie te weigeren, vul dan zeker een argumentatie in, 
  zodat de student hiervan op de hoogte is. Indien je ervoor kiest om de registratie te accepteren 
  dan zal de student een notificatie krijgen met oproep om met jou af te stemmen om vervolgens met de leerkans aan de slag te gaan. 
  De student zal jou contacteren op dit emailadres.</p> 
  
  <p>Met vriendelijke groet<br /> 
  Gentlestudent.gent</p>`;

  sendMail({
    to: issuerEmail,
    subject: `Inschrijving voor leerkans: ${title}`,
    html: content
  });
};

/**
 * Sends email to issuer when participant claims the badge.
 * @param {{ issuer: { issuerEmail, orgName }, opportunity: { title }, participant: { participantName }}} data Input data for the email
 * @param {string} data.issuer.issuerEmail email address of the issuer
 * @param {string} data.issuer.orgName organisation name of the issuer
 * @param {string} data.opportunity.title title of the opportunity
 * @param {string} data.participant.participantName name of the participant
 */
const sendBadgeClaimed = ({
  issuer: { issuerEmail, orgName },
  opportunity: { title },
  participant: { participantName }
}) => {
  // TODO student argumentation link + communication channel
  const content = `
  <p>Beste contactpersoon bij ${orgName}

  <p>${participantName} geeft aan de leerkans "${title}" bij uw organisatie succesvol te hebben voltooid. 
  Via deze link kan je de argumentatie van de student lezen en hem of haar de ‘badge’ toewijzen.</p>
  
  <p>Indien u niet akkoord gaat met de toewijzing van een badge of de argumentatie van 
  de student kan u dit hier communiceren naar de student.</p> 
  
  <p>Met vriendelijke groet<br /> 
  Gentlestudent.gent</p>`;

  sendMail({
    to: issuerEmail,
    subject: `Inschrijving voor leerkans: ${title}`,
    html: content
  });
};

/**
 * Sends email to participant when issuer has approved them
 * @param {{opportunity: { title }, participant: { participantEmail, participantName }, issuer: { issuerEmail, orgName }}} data Input data for the email
 * @param {string} data.opportunity.title title of the opportunity
 * @param {string} data.participant.participantName name of the participant
 * @param {string} data.participant.participantEmail email of the participant (the email recipient)
 * @param {string} data.issuer.issuerEmail email address of the issuer
 * @param {string} data.issuer.orgName name of the issuing organisation
 */
const sendAcceptedParticipation = ({
  opportunity: { title },
  participant: { participantEmail, participantName },
  issuer: { issuerEmail, orgName }
}) => {
  const content = `
  <p>Beste ${participantName}</p>

  <p>Je hebt je onlangs geregistreerd om met ${title} van ${orgName} aan de slag te gaan. 
  Je registratie werd door de organisatie geaccepteerd.</p>  
    
  <p>Je kan via ${issuerEmail} contact opnemen met de organisatie om verder af te stemmen.</p> 
    
  <p>Veel succes!</p>
    
  <p>Met vriendelijke groet<br /> 
  Gentlestudent.gent</p>`;

  sendMail({
    to: participantEmail,
    subject: `Geaccepteerd voor leerkans: ${title}`,
    html: content
  });
};

/**
 * Sends email to participant when issuer has rejected them
 * @param {{ participant: { participantEmail, participantName }, issuer: { orgName, issuerEmail }, opportunity: { title }, reason }} data Input data for the email
 * @param {string} data.opportunity.title title of the opportunity
 * @param {string} data.participant.participantName name of the participant
 * @param {string} data.participant.participantEmail email of the participant (the email recipient)
 * @param {string} data.issuer.issuerEmail email address of the issuer
 * @param {string} data.issuer.orgName name of the issuing organisation
 * @param {string} data.reason reason of rejection
 */
const sendRejectedParticipation = ({
  participant: { participantEmail, participantName },
  issuer: { orgName, issuerEmail },
  opportunity: { title },
  reason
}) => {
  const content = `
  <p>Beste ${participantName}</p> 

  <p>Je hebt je onlangs geregistreerd om met "${title}" van ${orgName} aan de slag te gaan. 
  Je registratie werd door de organisatie helaas niet geaccepteerd omwille van onderstaande reden.</p>

  “${reason}” 

  <p>Je kan via ${issuerEmail} contact opnemen met de organisatie indien je graag verdere toelichting had gekregen.</p> 

  <p>Met vriendelijke groet<br /> 
  Gentlestudent.gent</p>`;

  sendMail({
    to: participantEmail,
    subject: ``,
    html: content
  });
};

// const sendBadgeIssued = (to, displayName, org, assertion) => {};

module.exports = {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendEmailChangeConfirmation,
  sendBadgeClaimed,
  sendAcceptedParticipation,
  sendRejectedParticipation,
  // sendBadgeIssued,
  sendNewOrg,
  sendNewParticipant
};
