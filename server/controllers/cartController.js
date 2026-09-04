const Book = require('../models/bookModel');
const Cart = require('../models/cartModel');
const { httpError } = require('../utils/httpError');
const { getShippingFee } = require('../utils/pricing');
const { quantity: parseQuantity } = require('../utils/validation');

const bookIdOf = (item) => String(item.book?._id || item.book);

const recalculateCart = async (cart) => {
  const ids = cart.books.map((item) => item.book?._id || item.book);
  const books = await Book.find({ _id: { $in: ids } }).select('price');
  const priceById = new Map(books.map((book) => [String(book._id), book.price]));

  cart.books = cart.books.filter((item) => priceById.has(bookIdOf(item)));
  cart.subtotal = cart.books.reduce(
    (sum, item) => sum + priceById.get(bookIdOf(item)) * item.quantity,
    0,
  );
  cart.subtotal = Math.round(cart.subtotal * 100) / 100;
};

const populatedCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'books.book',
    select: 'name author genre image price isActive',
  });
  if (!cart) {
    const shippingFee = getShippingFee();
    return { books: [], subtotal: 0, shippingFee, total: shippingFee };
  }

  const result = cart.toObject();
  result.books = result.books.filter((item) => item.book);
  result.subtotal = Math.round(
    result.books.reduce((sum, item) => sum + item.book.price * item.quantity, 0) * 100,
  ) / 100;
  result.shippingFee = getShippingFee();
  result.total = result.subtotal + result.shippingFee;
  return result;
};

const addToCart = async (req, res) => {
  const amount = parseQuantity(req.body.quantity ?? 1);
  const book = await Book.findById(req.params.id);
  if (!book || !book.isActive) throw httpError(404, 'This book is not available.');

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, books: [], subtotal: 0 });

  const item = cart.books.find((entry) => bookIdOf(entry) === String(book._id));
  if (item) {
    item.quantity = parseQuantity(item.quantity + amount);
  } else {
    cart.books.push({ book: book._id, quantity: amount });
  }

  await recalculateCart(cart);
  await cart.save();
  res.status(201).json({ message: `${book.name} was added to your cart.`, cart: await populatedCart(req.user._id) });
};

const updateCartItem = async (req, res) => {
  const amount = parseQuantity(req.body.quantity, { allowZero: true });
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw httpError(404, 'Cart not found.');

  const index = cart.books.findIndex((entry) => bookIdOf(entry) === req.params.id);
  if (index < 0) throw httpError(404, 'Book is not in your cart.');

  if (amount === 0) cart.books.splice(index, 1);
  else cart.books[index].quantity = amount;

  if (cart.books.length === 0) {
    await Cart.deleteOne({ _id: cart._id });
  } else {
    await recalculateCart(cart);
    await cart.save();
  }

  res.json({ message: 'Cart updated.', cart: await populatedCart(req.user._id) });
};

const deleteBook = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw httpError(404, 'Cart not found.');

  const initialLength = cart.books.length;
  cart.books = cart.books.filter((entry) => bookIdOf(entry) !== req.params.id);
  if (cart.books.length === initialLength) throw httpError(404, 'Book is not in your cart.');

  if (cart.books.length === 0) {
    await Cart.deleteOne({ _id: cart._id });
  } else {
    await recalculateCart(cart);
    await cart.save();
  }
  res.json({ message: 'Book removed from cart.', cart: await populatedCart(req.user._id) });
};

const getCart = async (req, res) => {
  res.json(await populatedCart(req.user._id));
};

module.exports = { addToCart, deleteBook, getCart, updateCartItem };
