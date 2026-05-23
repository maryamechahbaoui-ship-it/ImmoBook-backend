const nodemailer = require('nodemailer');
//Nodemailer est une librairie Node.js 
// qui sait parler le protocole SMTP 
// (le protocole qu'utilisent les serveurs mail). 
// et permet d’envoyer des emails avec Node.js

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({   //Le transporter est une "connexion configurée" vers ton serveur SMTP.Pourquoi process.env ? Parce qu'on ne met jamais des mots de passe dans le code source
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({  //sendMail est async — envoyer un email prend du temps (réseau). Le await dit "attends que l'email soit parti avant de continuer".
    from: `"ImmoBook" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;