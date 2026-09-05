import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Container, Form } from 'react-bootstrap';
import { FaCircleInfo, FaPen, FaPlus, FaTrashCan } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import AddBook from '../components/AddBook';
import AdminInfo from '../components/AdminInfo';
import Loading from '../components/Loading';
import UpdateBook from '../components/UpdateBook';
import Rating from '../components/Rating';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/format';

export default function BookArchives() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/booknook/books', { signal: controller.signal })
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
    () => [...new Set(books.map((book) => book.genre))].sort(),
    [books],
  );

  const visibleBooks = useMemo(() => {
    const term = search.toLowerCase().trim();
    return books
      .filter((book) => {
        const matchesSearch = !term || `${book.name} ${book.author}`.toLowerCase().includes(term);
        const matchesGenre = !genre || book.genre === genre;
        const matchesAvailability = availability === 'all' || (availability === 'active' ? book.isActive : !book.isActive);
        return matchesSearch && matchesGenre && matchesAvailability;
      })
      .toSorted((a, b) => sort === 'title' ? a.name.localeCompare(b.name) : new Date(b.createdOn) - new Date(a.createdOn));
  }, [availability, books, genre, search, sort]);

  const updateInList = (updatedBook) => {
    setBooks((current) => current.map((book) => book._id === updatedBook._id ? updatedBook : book));
  };

  const toggleAvailability = async (book) => {
    setError('');
    try {
      const action = book.isActive ? 'archive' : 'activate';
      const result = await api(`/booknook/books/${action}/${book._id}`, { method: 'PUT' });
      updateInList(result.book);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteBook = async (book) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: `Delete “${book.name}”?`,
      text: 'Archive it instead if existing orders should retain a catalog reference.',
      showCancelButton: true,
      confirmButtonText: 'Delete permanently',
      confirmButtonColor: '#b42318',
    });
    if (!confirmation.isConfirmed) return;

    try {
      await api(`/booknook/books/${book._id}`, { method: 'DELETE' });
      setBooks((current) => current.filter((item) => item._id !== book._id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (isLoading) return <Loading label="Loading the catalog" fullPage />;

  return (
    <div className="page-shell admin-page">
      <Container>
        <header className="admin-heading">
          <div><span className="eyebrow">Administrator</span><h1>Catalog</h1><p>Manage what readers see in the store.</p></div>
          <div className="admin-heading__actions">
            <Button variant="outline-secondary" onClick={() => setShowInfo(true)} aria-label="Catalog help"><FaCircleInfo /></Button>
            <Button className="button-primary" onClick={() => setShowAdd(true)}><FaPlus /> Add book</Button>
          </div>
        </header>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="admin-filters">
          <Form.Control type="search" placeholder="Search title or author" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Form.Select value={genre} onChange={(event) => setGenre(event.target.value)} aria-label="Filter by genre">
            <option value="">All genres</option>{genres.map((item) => <option key={item}>{item}</option>)}
          </Form.Select>
          <Form.Select value={availability} onChange={(event) => setAvailability(event.target.value)} aria-label="Filter by availability">
            <option value="all">Any availability</option><option value="active">Active</option><option value="archived">Archived</option>
          </Form.Select>
          <Form.Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort catalog">
            <option value="newest">Newest first</option><option value="title">Title A–Z</option>
          </Form.Select>
        </div>

        <p className="result-count">{visibleBooks.length} titles</p>
        <div className="catalog-admin-grid">
          {visibleBooks.map((book) => (
            <article className={`catalog-admin-card${book.isActive ? '' : ' catalog-admin-card--archived'}`} key={book._id}>
              <img src={book.image} alt={`Cover of ${book.name}`} />
              <div className="catalog-admin-card__content">
                <Badge bg={book.isActive ? 'success' : 'secondary'}>{book.isActive ? 'Active' : 'Archived'}</Badge>
                <h2>{book.name}</h2><p>{book.author}</p><Rating book={book} /><strong>{formatCurrency(book.price)}</strong>
              </div>
              <div className="catalog-admin-card__actions">
                <Button variant="outline-dark" onClick={() => setSelectedBook(book)}><FaPen /> Edit</Button>
                <Button variant={book.isActive ? 'outline-warning' : 'outline-success'} onClick={() => toggleAvailability(book)}>{book.isActive ? 'Archive' : 'Activate'}</Button>
                <Button variant="outline-danger" onClick={() => deleteBook(book)} aria-label={`Delete ${book.name}`}><FaTrashCan /></Button>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <AddBook show={showAdd} onClose={() => setShowAdd(false)} onBookAdded={(book) => setBooks((current) => [book, ...current])} />
      {selectedBook && <UpdateBook key={selectedBook._id} show onClose={() => setSelectedBook(null)} book={selectedBook} onBookUpdated={updateInList} />}
      <AdminInfo show={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}
