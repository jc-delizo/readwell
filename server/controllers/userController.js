const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { createAccessToken } = require('../middleware/auth');
const { httpError } = require('../utils/httpError');
const { email, mobile, text } = require('../utils/validation');

const publicUser = (user) => {
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  return result;
};

const registerUser = async (req, res) => {
  const name = text(req.body.name, 'Name', { min: 2, max: 100 });
  const normalizedEmail = email(req.body.email);
  const mobileNo = mobile(req.body.mobileNo);
  const password = text(req.body.password, 'Password', { min: 8, max: 72 });

  if (await User.exists({ email: normalizedEmail })) {
    throw httpError(409, 'An account with that email already exists.');
  }

  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const user = await User.create({
    name,
    email: normalizedEmail,
    mobileNo,
    password: await bcrypt.hash(password, 12),
    isAdmin: Boolean(bootstrapEmail && normalizedEmail === bootstrapEmail),
  });

  res.status(201).json({
    message: `Welcome to ReadWell, ${user.name}!`,
    user: publicUser(user),
    access: createAccessToken(user),
  });
};

const loginUser = async (req, res) => {
  const normalizedEmail = email(req.body.email);
  const password = text(req.body.password, 'Password', { min: 1, max: 72 });
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(401, 'Email or password is incorrect.');
  }

  res.json({ access: createAccessToken(user), user: publicUser(user) });
};

const getProfile = async (req, res) => {
  res.json(publicUser(req.user));
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found.');
  res.json(publicUser(user));
};

const getAllUsers = async (_req, res) => {
  const users = await User.find().sort({ createdOn: -1 });
  res.json(users.map(publicUser));
};

const setAdminStatus = (isAdmin) => async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found.');
  if (user._id.equals(req.user._id)) {
    throw httpError(400, 'You cannot change your own administrator role.');
  }

  const protectedEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (!isAdmin && protectedEmail && user.email === protectedEmail) {
    throw httpError(403, 'The bootstrap administrator cannot be demoted.');
  }

  user.isAdmin = isAdmin;
  await user.save();
  res.json({
    message: `${user.name} is now ${isAdmin ? 'an administrator' : 'a customer'}.`,
    user: publicUser(user),
  });
};

const promoteToAdmin = setAdminStatus(true);
const demoteToUser = setAdminStatus(false);

module.exports = {
  demoteToUser,
  getAllUsers,
  getProfile,
  getUser,
  loginUser,
  promoteToAdmin,
  registerUser,
};
