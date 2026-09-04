const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const { httpError } = require('../utils/httpError');
const { getShippingFee } = require('../utils/pricing');
const { text } = require('../utils/validation');

const orderPopulation = [
  { path: 'user', select: 'name email mobileNo' },
  { path: 'books.book', select: 'name author genre image price' },
];

const checkout = async (req, res) => {
  const shippingAddress = text(req.body.shippingAddress, 'Shipping address', {
    min: 8,
    max: 300,
  });
  const paymentMode = text(req.body.paymentMode, 'Payment mode', { max: 40 });
  if (paymentMode !== 'COD') {
    throw httpError(400, 'Only cash on delivery is currently available.');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('books.book');
  if (!cart || cart.books.length === 0) throw httpError(400, 'Your cart is empty.');
  if (cart.books.some((item) => !item.book || !item.book.isActive)) {
    throw httpError(409, 'A book in your cart is no longer available. Refresh your cart and try again.');
  }

  const books = cart.books.map((item) => ({
    book: item.book._id,
    name: item.book.name,
    author: item.book.author,
    image: item.book.image,
    price: item.book.price,
    quantity: item.quantity,
  }));
  const subtotal = books.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = getShippingFee();

  const order = await Order.create({
    user: req.user._id,
    books,
    shippingAddress,
    shippingFee,
    totalPrice: Math.round((subtotal + shippingFee) * 100) / 100,
    modeOfPayment: paymentMode,
  });
  await Cart.deleteOne({ _id: cart._id });

  await order.populate(orderPopulation);
  res.status(201).json({ message: 'Order placed successfully.', order });
};

const getOrdersOfUser = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate(orderPopulation[1])
    .sort({ createdOn: -1 });
  res.json(orders);
};

const getOrdersOfAllUsers = async (_req, res) => {
  const orders = await Order.find().populate(orderPopulation).sort({ createdOn: -1 });
  res.json(orders);
};

const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found.');

  const ownsOrder = order.user.equals(req.user._id);
  if (!ownsOrder && !req.user.isAdmin) throw httpError(403, 'You cannot cancel this order.');
  if (ownsOrder && !req.user.isAdmin) {
    if (order.isDelivered) throw httpError(409, 'A delivered order cannot be cancelled.');
    const cancellationWindow = 12 * 60 * 60 * 1_000;
    if (Date.now() - order.createdOn.getTime() > cancellationWindow) {
      throw httpError(409, 'Orders can only be cancelled within 12 hours.');
    }
  }

  await Order.deleteOne({ _id: order._id });
  res.json({ message: 'Order cancelled.' });
};

const orderDeliver = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found.');

  order.isDelivered =
    typeof req.body.isDelivered === 'boolean' ? req.body.isDelivered : !order.isDelivered;
  await order.save();
  await order.populate(orderPopulation);
  res.json(order);
};

const ordersByDeliveryState = (isDelivered) => async (_req, res) => {
  const orders = await Order.find({ isDelivered })
    .populate(orderPopulation)
    .sort({ createdOn: -1 });
  res.json(orders);
};

const delivered = ordersByDeliveryState(true);
const notDelivered = ordersByDeliveryState(false);

module.exports = {
  checkout,
  deleteOrder,
  delivered,
  getOrdersOfAllUsers,
  getOrdersOfUser,
  notDelivered,
  orderDeliver,
};
