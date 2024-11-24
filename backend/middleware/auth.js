const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { isBlacklisted } = require('./tokenBlacklist');

// Function to generate a JWT
const generateToken = async (user) => {
  // Fetch the user with the role included
  const userWithRole = await User.findOne({ where: { id: user.id }, include: Role });
  if (!userWithRole || !userWithRole.Role) {
    throw new Error('User role not found');
  }

  const payload = {
    id: userWithRole.id,
    username: userWithRole.username,
    role: userWithRole.Role.name // Ensure role is included
  };

  const options = {
    expiresIn: '1h' // Token expiration time
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  return token;
};

// Middleware to authenticate the user
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (isBlacklisted(token)) {
    return res.status(401).send({ error: 'Token is blacklisted. Please log in again.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id }, include: Role });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Middleware to authorize based on roles
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.Role.name)) {
      return res.status(403).send({ error: 'Access denied.' });
    }
    next();
  };
};


module.exports = { generateToken, authenticate, authorize };