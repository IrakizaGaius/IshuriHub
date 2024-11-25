const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `ishurihub-production.up.railway.app/api/users/reset-password?token=${token}`;
  const mailOptions = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Password Reset',
    text: `You are receiving this because you have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${resetUrl}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verification sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email verification to ${email}:`, error);
  }
};
const sendEmailVerification = async (email, token) => {
  const verificationUrl = `ishurihub-production.up.railway.app/api/users/verify-email?token=${token}`;
  const mailOptions = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Email Verification',
    text: `You are receiving this because you have registered for an account in Ishuri Hub System.\n\n
           Please click on the following link, or paste this into your browser to verify your email address:\n\n
           ${verificationUrl}\n\n
           If you did not request this, please ignore this email.\n`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verification sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email verification to ${email}:`, error);
  }
};

// Function to generate and send a login code
const sendLoginCode = async (email, code) => {
  const mailOptions = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Your Login Code',
    text: `You are receiving this because you requested a login code for your account.\n\n
           Your login code is: ${code}\n\n
           If you did not request this, please ignore this email.\n`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Login code sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send login code to ${email}:`, error);
  }
};

const ParentData = async (to, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
  }
};


module.exports = { sendPasswordResetEmail, sendEmailVerification, sendLoginCode, ParentData };
