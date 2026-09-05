import { demoEngagement } from './lib/demo-rating.mjs';

const appUrl = (process.env.APP_URL || 'http://localhost:5020').replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL || 'admin@readwell.demo';
const adminPassword = process.env.ADMIN_PASSWORD;
const expectedBookCount = Number.parseInt(process.env.EXPECTED_BOOK_COUNT || '0', 10);

if (!adminPassword) throw new Error('Set ADMIN_PASSWORD before running the rating backfill.');
if (!Number.isInteger(expectedBookCount) || expectedBookCount < 0) {
  throw new Error('EXPECTED_BOOK_COUNT must be a non-negative integer.');
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const request = async (url, options = {}) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      headers: { accept: 'application/json', ...options.headers },
    });
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (response.ok) return payload;
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await wait(1_000 * (2 ** attempt));
      continue;
    }
    const detail = payload?.message || payload || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${detail}`);
  }
  throw new Error('Request failed after retries.');
};

const login = await request(`${appUrl}/booknook/users/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});

if (!login?.access || !login?.user?.isAdmin) {
  throw new Error('The supplied account is not a ReadWell administrator.');
}

const authenticatedRequest = (path, options = {}) => request(`${appUrl}${path}`, {
  ...options,
  headers: { authorization: `Bearer ${login.access}`, ...options.headers },
});

const books = await authenticatedRequest('/booknook/books');
if (expectedBookCount && books.length !== expectedBookCount) {
  throw new Error(`Expected ${expectedBookCount} books but found ${books.length}; no ratings were changed.`);
}
if (!books.length) throw new Error('No books were found; no ratings were changed.');

for (let start = 0; start < books.length; start += 6) {
  const batch = books.slice(start, start + 6);
  await Promise.all(batch.map((book) => authenticatedRequest(`/booknook/books/${book._id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(demoEngagement(book)),
  })));
  console.log(`Rated ${Math.min(start + batch.length, books.length)} of ${books.length} books.`);
}

const updatedBooks = await authenticatedRequest('/booknook/books');
const mismatches = updatedBooks.filter((book) => {
  const expected = demoEngagement(book);
  return book.rating !== expected.rating || book.reviewCount !== expected.reviewCount;
});

if (mismatches.length) {
  throw new Error(`${mismatches.length} books did not receive the expected rating data.`);
}

const distribution = updatedBooks.reduce((counts, book) => {
  counts[book.rating] = (counts[book.rating] || 0) + 1;
  return counts;
}, {});

console.log(`Verified rating data for ${updatedBooks.length} books.`);
console.table(distribution);
