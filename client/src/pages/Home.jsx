import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { FaArrowRight, FaBookOpen, FaBoxOpen, FaShieldHeart } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';
import { api } from '../lib/api';
import { selectDiverseBooks } from '../lib/catalog';

const HERO_TITLES = [
  'The Ballad of Never After',
  'In the Dream House',
  'The Way of Kings',
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/booknook/books/activebooks?limit=500', { signal: controller.signal })
      .then((catalog) => {
        setBooks(catalog);
        setNewArrivals(selectDiverseBooks(catalog, 4));
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const genres = useMemo(
    () => [...new Set(books.map((book) => book.genre).filter(Boolean))].sort(),
    [books],
  );
  const heroBooks = useMemo(() => {
    const featured = HERO_TITLES
      .map((title) => books.find((book) => book.name === title))
      .filter(Boolean);
    const featuredIds = new Set(featured.map((book) => book._id));
    const fallbacks = books.filter((book) => !featuredIds.has(book._id));
    return [...featured, ...fallbacks].slice(0, 3);
  }, [books]);

  return (
    <>
      <section className="hero-section">
        <Container className="hero-section__grid">
          <div className="hero-section__copy">
            <span className="eyebrow">Your next chapter starts here</span>
            <h1>Books worth getting lost in.</h1>
            <p>
              Discover thoughtful reads for curious minds, from timeless stories to
              practical ideas you can use today.
            </p>
            <div className="hero-section__actions">
              <Button as={Link} to="/books" className="button-primary">
                Explore the shelves <FaArrowRight aria-hidden="true" />
              </Button>
              <Button as={Link} to="/register" variant="link" className="button-text">
                Create an account
              </Button>
            </div>
          </div>

          <div className="hero-books" aria-label="A selection of books at ReadWell">
            {heroBooks.map((book, index) => (
              <Link
                to={`/bookpage/${book._id}`}
                className={`hero-book hero-book--${index + 1}`}
                key={book._id}
              >
                <img src={book.image} alt={`Cover of ${book.name}`} />
              </Link>
            ))}
            {!isLoading && heroBooks.length === 0 && (
              <div className="hero-books__placeholder"><FaBookOpen aria-hidden="true" /></div>
            )}
          </div>
        </Container>
      </section>

      <section className="benefits-strip" aria-label="Why shop with ReadWell">
        <Container className="benefits-strip__grid">
          <div><FaBookOpen /><span><strong>Curated catalog</strong>Books selected for every kind of reader</span></div>
          <div><FaShieldHeart /><span><strong>Secure shopping</strong>Your account and orders stay protected</span></div>
          <div><FaBoxOpen /><span><strong>Simple delivery</strong>Clear pricing and cash on delivery</span></div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Fresh from the shelf</span>
              <h2>New arrivals</h2>
            </div>
            <Link to="/books" className="text-link">Browse all books <FaArrowRight /></Link>
          </div>

          {isLoading && <Loading label="Opening the shelves" />}
          {error && <Alert variant="danger">We could not load the catalog: {error}</Alert>}
          {!isLoading && !error && newArrivals.length > 0 && (
            <div className="book-grid">
              {newArrivals.map((book) => <BookCard key={book._id} book={book} />)}
            </div>
          )}
          {!isLoading && !error && newArrivals.length === 0 && (
            <div className="empty-state">
              <FaBookOpen aria-hidden="true" />
              <h3>The shelves are being stocked.</h3>
              <p>Check back soon for new reads.</p>
            </div>
          )}
        </Container>
      </section>

      {genres.length > 0 && (
        <section className="genre-section">
          <Container>
            <span className="eyebrow">Read by mood</span>
            <h2>Find your corner of the bookstore</h2>
            <div className="genre-cloud">
              {genres.map((genre) => (
                <Link to={`/books?genre=${encodeURIComponent(genre)}`} key={genre}>{genre}</Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <footer className="site-footer">
        <Container className="site-footer__content">
          <div>
            <strong>ReadWell</strong>
            <p>Good books. Quiet moments. Better days.</p>
          </div>
          <p>© 2023 ReadWell by JC Delizo</p>
        </Container>
      </footer>
    </>
  );
}
