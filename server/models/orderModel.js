const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    name: { type: String, trim: true },
    author: { type: String, trim: true },
    image: { type: String, trim: true },
    price: { type: Number, min: 0 },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
      default: 1,
    },
  },
  { _id: true },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required.'],
      index: true,
    },
    books: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, 'An order must contain a book.'],
    },
    shippingAddress: {
      type: String,
      required: [true, 'Shipping address is required.'],
      trim: true,
      maxlength: 300,
    },
    shippingFee: {
      type: Number,
      min: 0,
      default: 100,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required.'],
      min: 0,
    },
    modeOfPayment: {
      type: String,
      required: [true, 'Payment mode is required.'],
      trim: true,
      maxlength: 40,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' },
    versionKey: false,
  },
);

orderSchema.index({ user: 1, createdOn: -1 });

module.exports = mongoose.model('Order', orderSchema);
