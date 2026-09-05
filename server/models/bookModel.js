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
    rating: {
      type: Number,
      default: 4,
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative.'],
      max: [1_000_000, 'Rating count cannot exceed 1,000,000.'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating count must be a whole number.',
      },
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
bookSchema.index({ isActive: 1, rating: -1, reviewCount: -1 });

module.exports = mongoose.model('Book', bookSchema);
