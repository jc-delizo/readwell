export const bookRating = (book) => {
  const rating = Number(book?.rating);
  return Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : 0;
};

export const bookReviewCount = (book) => {
  const count = Number(book?.reviewCount);
  return Number.isInteger(count) && count >= 0 ? count : 0;
};

export const popularityScore = (book) => {
  const rating = bookRating(book);
  const reviews = bookReviewCount(book);
  return rating ? rating * Math.log10(reviews + 1) : 0;
};

export const compareByPopularity = (first, second) =>
  popularityScore(second) - popularityScore(first)
  || bookRating(second) - bookRating(first)
  || bookReviewCount(second) - bookReviewCount(first)
  || first.name.localeCompare(second.name);

const shuffled = (items, random) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

export const selectDiverseBooks = (books, count, random = Math.random) => {
  const genreBuckets = new Map();
  books.forEach((book) => {
    if (!genreBuckets.has(book.genre)) genreBuckets.set(book.genre, []);
    genreBuckets.get(book.genre).push(book);
  });

  const selected = shuffled([...genreBuckets.values()], random)
    .slice(0, count)
    .map((bucket) => bucket[Math.floor(random() * bucket.length)]);

  if (selected.length === count) return selected;

  const selectedIds = new Set(selected.map((book) => book._id));
  const remaining = shuffled(books.filter((book) => !selectedIds.has(book._id)), random);
  return [...selected, ...remaining].slice(0, count);
};
