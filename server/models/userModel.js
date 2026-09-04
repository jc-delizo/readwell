const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
      index: true,
    },
    mobileNo: {
      type: String,
      required: [true, 'Mobile number is required.'],
      trim: true,
      maxlength: 20,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' },
    versionKey: false,
    toJSON: {
      transform: (_document, result) => {
        delete result.password;
        return result;
      },
    },
  },
);

module.exports = mongoose.model('User', userSchema);
