import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Container } from 'react-bootstrap';
import { FaArrowLeft, FaBagShopping } from 'react-icons/fa6';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/format';

export default function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [book, setBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadedId, setLoadedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      api(`/booknook/books/specificbook/${id}`, { signal: controller.signal }),
      api('/booknook/books/activebooks?limit=200', { signal: controller.signal }),
    ])
      .then(([selectedBook, allBooks]) => {
        setBook(selectedBook);
        setError('');
        setRecommendations(
          allBooks
            .filter((item) => item.genre === selectedBook.genre && item._id !== selectedBook._id)
            .slice(0, 4),
        );
        setLoadedId(id);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setBook(null);
          setError(requestError.message);
          setLoadedId(id);
        }
      });

    return () => controller.abort();
  }, [id]);

  const addToCart = async () => {
    if (!user.id) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setIsAdding(true);
    try {
      await api(`/booknook/cart/add-to-cart/${book._id}`, {
        method: 'POST',
        body: { quantity: 1 },
      });
      await Swal.fire({
        icon: 'success',
        title: 'Added to your cart',
        text: `${book.name} is ready when you are.`,
        showCancelButton: true,
        confirmButtonText: 'View cart',
        cancelButtonText: 'Keep browsing',
      }).then((result) => {
        if (result.isConfirmed) navigate('/cart');
      });
    } catch (requestError) {
      Swal.fire({ icon: 'error', title: 'Could not add book', text: requestError.message });
    } finally {
      setIsAdding(false);
    }
  };

  if (loadedId !== id) return <Loading label="Opening this book" fullPage />;
  if (error || !book) {
    return (
      <Container className="page-shell">
        <Alert variant="danger">{error || 'Book not found.'}</Alert>
        <Button as={Link} to="/books" variant="outline-dark"><FaArrowLeft /> Back to books</Button>
      </Container>
    );
  }

  return (
    <div className="page-shell book-detail-page">
      <Container>
        <Link to="/books" className="back-link"><FaArrowLeft /> Back to all books</Link>
        <section className="book-detail">
          <div className="book-detail__cover">
            <img src={book.image} alt={`Cover of ${book.name}`} />
          </div>
          <div className="book-detail__content">
            <Badge className="book-detail__genre">{book.genre}</Badge>
            <h1>{book.name}</h1>
            <p className="book-detail__author">by {book.author}</p>
            <p className="book-detail__description">{book.description}</p>
            <div className="book-detail__purchase">
              <strong>{formatCurrency(book.price)}</strong>
              {!user.isAdmin && (
                <Button className="button-primary" onClick={addToCart} disabled={isAdding || !book.isActive}>
                  <FaBagShopping aria-hidden="true" /> {isAdding ? 'Adding…' : 'Add to cart'}
                </Button>
              )}
            </div>
            {!book.isActive && <Alert variant="secondary">This title is currently unavailable.</Alert>}
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="recommendations">
            <div className="section-heading">
              <div><span className="eyebrow">Keep exploring</span><h2>More in {book.genre}</h2></div>
            </div>
            <div className="book-grid">
              {recommendations.map((item) => <BookCard key={item._id} book={item} />)}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
