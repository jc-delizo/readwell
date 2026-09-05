import { bookRating, bookReviewCount } from '../lib/catalog';

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export default function Rating({ book, large = false }) {
  const rating = bookRating(book);
  const reviewCount = bookReviewCount(book);

  if (!rating) return <span className="rating-summary rating-summary--unrated">Not yet rated</span>;

  const displayRating = rating.toFixed(1);
  const fullCount = reviewCount.toLocaleString('en-US');
  const label = `${displayRating} out of 5 stars from ${fullCount} ${reviewCount === 1 ? 'rating' : 'ratings'}`;

  return (
    <div
      className={`rating-summary${large ? ' rating-summary--large' : ''}`}
      aria-label={label}
      title={label}
    >
      <span className="rating-stars" aria-hidden="true">
        <span className="rating-stars__empty">★★★★★</span>
        <span className="rating-stars__fill" style={{ width: `${rating * 20}%` }}>★★★★★</span>
      </span>
      <strong>{displayRating}</strong>
      <span className="rating-summary__count">({compactNumber.format(reviewCount)})</span>
    </div>
  );
}
