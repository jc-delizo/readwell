const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: 2_000,
    },
    author: {
      type: String,
      required: [true, 'Author is required.'],
      trim: true,
      maxlength: 120,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required.'],
      trim: true,
      maxlength: 80,
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0.01, 'Price must be greater than zero.'],
    },
    image: {
      type: String,
      required: [true, 'Image is required.'],
      trim: true,
      maxlength: 2_000,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' },
    versionKey: false,
  },
);

bookSchema.index({ isActive: 1, createdOn: -1 });

module.exports = mongoose.model('Book', bookSchema);
