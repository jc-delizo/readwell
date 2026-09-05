const RATING_POOL = [
  3, 3.3, 3.6, 3.8,
  4, 4.1, 4.2, 4.3, 4.4, 4.4,
  4.5, 4.5, 4.6, 4.6, 4.7, 4.7,
  4.8, 4.8, 4.9, 4.9, 5,
];

const FEATURED_ENGAGEMENT = new Map([
  ['atomic habits', { rating: 4.8, reviewCount: 24_310 }],
  ['dune', { rating: 4.9, reviewCount: 21_476 }],
  ['educated', { rating: 4.8, reviewCount: 16_384 }],
  ['in the dream house', { rating: 4.8, reviewCount: 7_462 }],
  ['project hail mary', { rating: 4.9, reviewCount: 18_762 }],
  ['the ballad of never after', { rating: 4.9, reviewCount: 12_460 }],
  ['the great gatsby', { rating: 4.7, reviewCount: 19_538 }],
  ['the hobbit', { rating: 4.9, reviewCount: 22_841 }],
  ['the little prince', { rating: 5, reviewCount: 24_873 }],
  ['the midnight library', { rating: 4.7, reviewCount: 17_832 }],
  ['the way of kings', { rating: 5, reviewCount: 15_890 }],
]);

const stableHash = (value) => {
  let hash = 2_166_136_261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16_777_619) >>> 0;
  }
  return hash;
};

export const demoEngagement = ({ name, author, genre }) => {
  const title = String(name || '').trim().toLocaleLowerCase();
  const featured = FEATURED_ENGAGEMENT.get(title);
  if (featured) return featured;

  const identity = `${title}:${author || ''}:${genre || ''}`.toLocaleLowerCase();
  const rating = RATING_POOL[stableHash(identity) % RATING_POOL.length];
  const reviewCount = 37 + (stableHash(`${identity}:ratings`) % 5_964);
  return { rating, reviewCount };
};
