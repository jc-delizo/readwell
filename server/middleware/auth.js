const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { httpError } = require('../utils/httpError');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.SECRET;
  if (!secret || secret.length < 32) {
    throw httpError(500, 'JWT_SECRET must contain at least 32 characters.');
  }
  return secret;
};

const createAccessToken = (user) =>
  jwt.sign(
    { email: user.email, isAdmin: user.isAdmin },
    getJwtSecret(),
    {
      subject: user._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
  );

const getBearerToken = (req) => {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw httpError(401, 'Authentication is required.');
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    throw httpError(401, 'Authentication is required.');
  }
  return token;
};

const authenticate = async (req, _res, next) => {
  try {
    const decoded = jwt.verify(getBearerToken(req), getJwtSecret());
    const userId = decoded.sub || decoded.id || decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      throw httpError(401, 'This account no longer exists.');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(httpError(401, 'Your session is invalid or has expired.'));
      return;
    }
    next(error);
  }
};

const requireAdmin = (req, _res, next) => {
  if (!req.user?.isAdmin) {
    next(httpError(403, 'Administrator access is required.'));
    return;
  }
  next();
};

module.exports = { authenticate, createAccessToken, getJwtSecret, requireAdmin };
