import { demoEngagement } from './lib/demo-rating.mjs';

const appUrl = (process.env.APP_URL || 'http://localhost:5020').replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL || 'admin@readwell.demo';
const adminPassword = process.env.ADMIN_PASSWORD;
const booksPerGenre = Number.parseInt(process.env.BOOKS_PER_GENRE || '50', 10);
const marker = 'ReadWell expanded demo collection';

const genres = [
  { name: 'Classic', subject: 'classic literature' },
  { name: 'Science Fiction', subject: 'science fiction' },
  { name: 'Fantasy', subject: 'fantasy' },
  { name: 'Self Development', subject: 'self-help' },
  { name: 'Memoir', subject: 'memoir' },
  { name: 'Contemporary Fiction', subject: 'contemporary fiction' },
];

if (!adminPassword) throw new Error('Set ADMIN_PASSWORD before running the catalog seeder.');
if (!Number.isInteger(booksPerGenre) || booksPerGenre < 1 || booksPerGenre > 100) {
  throw new Error('BOOKS_PER_GENRE must be an integer from 1 to 100.');
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const request = async (url, options = {}) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      headers: {
        accept: 'application/json',
        'user-agent': 'ReadWell demo catalog seeder (https://github.com/jc-delizo/readwell)',
        ...options.headers,
      },
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

const clean = (value, maximum) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, maximum);
const bookKey = (title, author) => `${title.toLocaleLowerCase()}::${author.toLocaleLowerCase()}`;
const stablePrice = (genre, title) => {
  const hash = [...`${genre}:${title}`].reduce(
    (total, character) => ((total * 31) + character.codePointAt(0)) >>> 0,
    0,
  );
  return 399 + (hash % 451);
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
  headers: {
    authorization: `Bearer ${login.access}`,
    ...options.headers,
  },
});

const existingBooks = await authenticatedRequest('/booknook/books');
const knownBooks = new Set(existingBooks.map((book) => bookKey(book.name, book.author)));

const collectCandidates = async ({ name, subject }, amount) => {
  const candidates = [];

  for (let page = 1; page <= 5 && candidates.length < amount; page += 1) {
    const parameters = new URLSearchParams({
      q: `subject:"${subject}" language:eng`,
      fields: 'key,title,author_name,cover_i,first_publish_year',
      limit: '100',
      page: String(page),
    });
    const results = await request(`https://openlibrary.org/search.json?${parameters}`);

    for (const work of results.docs || []) {
      const title = clean(work.title, 160);
      const author = clean(work.author_name?.[0], 120);
      if (!title || !author || !work.cover_i) continue;

      const key = bookKey(title, author);
      if (knownBooks.has(key)) continue;
      knownBooks.add(key);

      const publication = Number.isInteger(work.first_publish_year)
        ? `, first published in ${work.first_publish_year}`
        : '';
      const candidate = {
        name: title,
        author,
        genre: name,
        price: stablePrice(name, title),
        image: `https://covers.openlibrary.org/b/id/${work.cover_i}-L.jpg`,
        description: `${title} is a ${name.toLocaleLowerCase()} selection curated for the ${marker}${publication}.`,
      };
      candidates.push({ ...candidate, ...demoEngagement(candidate) });
      if (candidates.length === amount) break;
    }
  }

  if (candidates.length < amount) {
    throw new Error(`Open Library returned only ${candidates.length} usable ${name} books; ${amount} required.`);
  }
  return candidates;
};

for (const genre of genres) {
  const alreadySeeded = existingBooks.filter(
    (book) => book.genre === genre.name && book.description?.includes(marker),
  ).length;
  const needed = Math.max(0, booksPerGenre - alreadySeeded);
  if (!needed) {
    console.log(`${genre.name}: already has ${booksPerGenre} expansion books.`);
    continue;
  }

  const candidates = await collectCandidates(genre, needed);
  for (let start = 0; start < candidates.length; start += 6) {
    const batch = candidates.slice(start, start + 6);
    await Promise.all(batch.map((book) => authenticatedRequest('/booknook/books/add-book', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(book),
    })));
  }
  console.log(`${genre.name}: added ${candidates.length} books.`);
}

const finalBooks = await authenticatedRequest('/booknook/books');
const expansionCounts = Object.fromEntries(genres.map(({ name }) => [
  name,
  finalBooks.filter((book) => book.genre === name && book.description?.includes(marker)).length,
]));

console.log(`Catalog now contains ${finalBooks.length} books.`);
console.table(expansionCounts);

if (Object.values(expansionCounts).some((count) => count !== booksPerGenre)) {
  throw new Error('The final expansion is not evenly divided across genres.');
}
