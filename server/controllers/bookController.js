const Book = require('../models/bookModel');
const { httpError } = require('../utils/httpError');
const {
  escapeRegExp,
  positiveNumber,
  text,
} = require('../utils/validation');

const parseBook = (body, { partial = false } = {}) => {
  const fields = {};
  const definitions = {
    name: () => text(body.name, 'Name', { max: 160 }),
    description: () => text(body.description, 'Description', { max: 2_000 }),
    author: () => text(body.author, 'Author', { max: 120 }),
    genre: () => text(body.genre, 'Genre', { max: 80 }),
    price: () => positiveNumber(body.price, 'Price'),
    image: () => text(body.image, 'Image URL', { max: 2_000 }),
  };

  for (const [field, parse] of Object.entries(definitions)) {
    if (!partial || body[field] !== undefined) fields[field] = parse();
  }

  if (partial && Object.keys(fields).length === 0) {
    throw httpError(400, 'Provide at least one book field to update.');
  }
  return fields;
};

const getBooks = async (_req, res) => {
  const books = await Book.find().sort({ createdOn: -1 });
  res.json(books);
};

const uploadBooks = async (req, res) => {
  const book = await Book.create(parseBook(req.body));
  res.status(201).json({ message: `${book.name} was added.`, book });
};

const updateBooks = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw httpError(404, 'Book not found.');

  Object.assign(book, parseBook(req.body, { partial: true }));
  await book.save();
  res.json({ message: `${book.name} was updated.`, book });
};

const deleteBooks = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) throw httpError(404, 'Book not found.');
  res.json({ message: `${book.name} was deleted.` });
};

const setBookActive = (isActive) => async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw httpError(404, 'Book not found.');
  if (book.isActive === isActive) {
    throw httpError(409, `${book.name} is already ${isActive ? 'active' : 'archived'}.`);
  }

  book.isActive = isActive;
  await book.save();
  res.json({
    message: `${book.name} is now ${isActive ? 'active' : 'archived'}.`,
    book,
  });
};

const archiveBooks = setBookActive(false);
const activateBooks = setBookActive(true);

const getActiveBooks = async (req, res) => {
  const filter = { isActive: true };
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const genre = typeof req.query.genre === 'string' ? req.query.genre.trim() : '';
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 500);

  if (query) {
    const pattern = new RegExp(escapeRegExp(query.slice(0, 100)), 'i');
    filter.$or = [{ name: pattern }, { author: pattern }, { description: pattern }];
  }
  if (genre) filter.genre = genre.slice(0, 80);

  const books = await Book.find(filter).sort({ createdOn: -1 }).limit(limit);
  res.json(books);
};

const getArchivedBooks = async (_req, res) => {
  const archivedBooks = await Book.find({ isActive: false }).sort({ updatedOn: -1 });
  res.json(archivedBooks);
};

const specificBook = async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, isActive: true });
  if (!book) throw httpError(404, 'Book not found.');
  res.json(book);
};

const searchBooks = async (req, res) => {
  const name = text(req.body.name, 'Search term', { max: 100 });
  const books = await Book.find({
    isActive: true,
    name: new RegExp(escapeRegExp(name), 'i'),
  }).sort({ name: 1 });
  res.json(books);
};

module.exports = {
  activateBooks,
  archiveBooks,
  deleteBooks,
  getActiveBooks,
  getArchivedBooks,
  getBooks,
  searchBooks,
  specificBook,
  updateBooks,
  uploadBooks,
};
