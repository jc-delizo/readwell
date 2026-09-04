const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Copy server/.env.example to server/.env.');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
  console.log('MongoDB connected');
};

module.exports = connectDB;
