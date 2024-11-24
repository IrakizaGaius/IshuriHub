const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Role } = require('../models');
const { generateToken, authenticate } = require('../middleware/auth');
const { addToBlacklist } = require('../middleware/tokenBlacklist');
const { sendPasswordResetEmail,sendEmailVerification,sendLoginCode } = require('../services/emailService');



const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const roleRecord = await Role.findOne({ where: { name: role } });
    // Check if the user already exists by email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ error: 'User already exists' });
    }
    if (!roleRecord) {
      return res.status(400).send({ error: 'Invalid role' });
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const user = await User.create({ username, email, password: hashedPassword, roleId: roleRecord.id, emailVerificationToken,
      emailVerified: false });
    const token = await generateToken(user);
    await sendEmailVerification(user.email, emailVerificationToken);
    res.status(201).send({ user, token });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle Sequelize validation errors
      return res.status(400).send({ error: 'Validation error', details: error.errors });
    }
    console.error('Error during registration:', error);
    res.status(400).send({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username }, include: Role });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    const token = await generateToken(user);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Logout
router.get('/logout', authenticate, (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    addToBlacklist(token);
    res.send({ message: 'Successfully logged out' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to log out' });
  }
});
// Request Password Reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Request Body:', req.body);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send({ error: 'User with this email does not exist' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    await sendPasswordResetEmail(user.email, token);

    res.send({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).send({ error: 'Failed to send password reset email' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).send({ error: 'Password reset token is invalid or has expired' });
    }

    user.password = await bcrypt.hash(newPassword, 8);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.send({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to reset password' });
  }
});
// Email Verification
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ where: { emailVerificationToken: token } });

    if (!user) {
      return res.status(400).send({ error: 'Invalid or expired email verification token' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    res.send({ message: 'Email successfully verified' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to verify email' });
  }
});

// POST route to send login code to user's email
router.post('/send-login-code', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit random login code
    const loginCode = crypto.randomInt(100000, 999999);

    // Store login code with the user in the database for later verification
    user.loginCode = loginCode;
    user.loginCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes
    await user.save();

    // Send the code to the user's email
    await sendLoginCode(email, loginCode);
    res.status(200).json({ message: 'Login code sent successfully' });
  } catch (error) {
    console.error('Error sending login code:', error);
    res.status(500).json({ error: 'Failed to send login code.' });
  }
});


// POST route to verify the login code
router.post('/verify-login-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    // Check if the email and code are provided
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify if the code matches
    if (user.loginCode !== parseInt(code, 10)) {
      return res.status(401).json({ message: 'Invalid login code.' });
    }

    // Check if the login code has expired
    if (new Date() > new Date(user.loginCodeExpires)) {
      return res.status(401).json({ message: 'Login code has expired.' });
    }

    // Clear the login code and expiration time
    user.loginCode = null;
    user.loginCodeExpires = null;
    await user.save();

    // Generate a new token (optional, based on your authentication system)
    const token = crypto.randomBytes(32).toString('hex'); // Example token generation
    // Save the token or use your existing JWT/Auth mechanism here

    res.status(200).json({ message: 'Verification successful.', token });
  } catch (error) {
    console.error('Error verifying login code:', error);
    res.status(500).json({ error: 'Failed to verify login code.' });
  }
});


module.exports = router;