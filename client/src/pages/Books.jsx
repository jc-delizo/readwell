import { useEffect, useMemo, useState } from 'react';
import { Alert, Container, Form } from 'react-bootstrap';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';
import { api } from '../lib/api';

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const controller = new AbortController();
    api('/booknook/books/activebooks?limit=200', { signal: controller.signal })
      .then(setBooks)
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

  const visibleBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = books.filter((book) => {
      const matchesGenre = !genre || book.genre === genre;
      const matchesSearch =
        !term ||
        `${book.name} ${book.author} ${book.description}`.toLowerCase().includes(term);
      return matchesGenre && matchesSearch;
    });

    return filtered.toSorted((a, b) => {
      if (sort === 'title') return a.name.localeCompare(b.name);
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return new Date(b.createdOn) - new Date(a.createdOn);
    });
  }, [books, genre, search, sort]);

  const selectGenre = (selected) => {
    setGenre(selected);
    const next = new URLSearchParams(searchParams);
    if (selected) next.set('genre', selected);
    else next.delete('genre');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="page-shell catalog-page">
      <Container>
        <header className="page-heading">
          <span className="eyebrow">The ReadWell collection</span>
          <h1>Find a book for where you are—and where you’re going.</h1>
          <p>{books.length} titles ready to discover.</p>
        </header>

        <div className="catalog-toolbar">
          <label className="search-field">
            <span className="visually-hidden">Search books</span>
            <FaMagnifyingGlass aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by title, author, or keyword"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Form.Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort books">
            <option value="newest">Newest first</option>
            <option value="title">Title A–Z</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </Form.Select>
        </div>

        <div className="filter-pills" aria-label="Filter by genre">
          <button className={!genre ? 'active' : ''} onClick={() => selectGenre('')}>All</button>
          {genres.map((item) => (
            <button key={item} className={genre === item ? 'active' : ''} onClick={() => selectGenre(item)}>
              {item}
            </button>
          ))}
        </div>

        {isLoading && <Loading label="Loading books" />}
        {error && <Alert variant="danger">Could not load books: {error}</Alert>}
        {!isLoading && !error && (
          <>
            <p className="result-count">Showing {visibleBooks.length} {visibleBooks.length === 1 ? 'book' : 'books'}</p>
            {visibleBooks.length ? (
              <div className="book-grid">
                {visibleBooks.map((book) => <BookCard key={book._id} book={book} />)}
              </div>
            ) : (
              <div className="empty-state">
                <FaMagnifyingGlass aria-hidden="true" />
                <h2>No books match that search.</h2>
                <p>Try another keyword or clear the selected genre.</p>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
