import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { FaMinus, FaPlus, FaTrashCan } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import emptycart from '../assets/emptycart.svg';
import Loading from '../components/Loading';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/format';

const emptyCart = { books: [], subtotal: 0, shippingFee: 100, total: 100 };

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(emptyCart);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('COD');
  const [busyItem, setBusyItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/booknook/cart/view-cart', { signal: controller.signal })
      .then(setCart)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const updateQuantity = async (bookId, quantity) => {
    setBusyItem(bookId);
    setError('');
    try {
      const result = await api(`/booknook/cart/update-quantities/${bookId}`, {
        method: 'PUT',
        body: { quantity },
      });
      setCart(result.cart);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyItem('');
    }
  };

  const removeBook = async (bookId) => {
    setBusyItem(bookId);
    setError('');
    try {
      const result = await api(`/booknook/cart/remove-book/${bookId}`, { method: 'DELETE' });
      setCart(result.cart);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyItem('');
    }
  };

  const checkout = async (event) => {
    event.preventDefault();
    setIsCheckingOut(true);
    setError('');
    try {
      await api('/booknook/order/checkout', {
        method: 'POST',
        body: { shippingAddress, paymentMode },
      });
      setCart(emptyCart);
      const result = await Swal.fire({
        icon: 'success',
        title: 'Your order is in!',
        text: 'We’ll keep you updated as it makes its way to you.',
        showCancelButton: true,
        confirmButtonText: 'View my orders',
        cancelButtonText: 'Keep browsing',
      });
      navigate(result.isConfirmed ? '/orders' : '/books');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) return <Loading label="Loading your cart" fullPage />;

  return (
    <div className="page-shell cart-page">
      <Container>
        <header className="page-heading page-heading--compact">
          <span className="eyebrow">Your reading list</span>
          <h1>Shopping cart</h1>
        </header>
        {error && <Alert variant="danger">{error}</Alert>}

        {!cart.books?.length ? (
          <div className="empty-state">
            <img src={emptycart} alt="An empty shopping cart" />
            <h2>Your cart has room for a good story.</h2>
            <p>Explore the shelves and choose something that pulls you in.</p>
            <Button as={Link} to="/books" className="button-primary">Browse books</Button>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items" aria-label="Books in your cart">
              {cart.books.map((item) => (
                <Card className="cart-item" key={item._id}>
                  <img src={item.book.image} alt={`Cover of ${item.book.name}`} />
                  <div className="cart-item__details">
                    <span>{item.book.genre}</span>
                    <h2>{item.book.name}</h2>
                    <p>by {item.book.author}</p>
                    <strong>{formatCurrency(item.book.price)}</strong>
                  </div>
                  <div className="cart-item__actions">
                    <div className="quantity-picker" aria-label={`Quantity for ${item.book.name}`}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                        disabled={busyItem === item.book._id}
                        aria-label="Decrease quantity"
                      ><FaMinus /></button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                        disabled={busyItem === item.book._id || item.quantity >= 99}
                        aria-label="Increase quantity"
                      ><FaPlus /></button>
                    </div>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeBook(item.book._id)}
                      disabled={busyItem === item.book._id}
                    ><FaTrashCan /> Remove</button>
                  </div>
                </Card>
              ))}
            </section>

            <aside className="order-summary">
              <h2>Order summary</h2>
              <div><span>Items</span><strong>{formatCurrency(cart.subtotal)}</strong></div>
              <div><span>Delivery</span><strong>{formatCurrency(cart.shippingFee)}</strong></div>
              <div className="order-summary__total"><span>Total</span><strong>{formatCurrency(cart.total)}</strong></div>

              <Form onSubmit={checkout}>
                <Form.Group className="mb-3" controlId="shipping-address">
                  <Form.Label>Delivery address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    minLength={8}
                    maxLength={300}
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="Street, barangay, city, province"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4" controlId="payment-mode">
                  <Form.Label>Payment method</Form.Label>
                  <Form.Select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
                    <option value="COD">Cash on delivery</option>
                    <option disabled>GCash — coming soon</option>
                    <option disabled>Card — coming soon</option>
                  </Form.Select>
                </Form.Group>
                <Button type="submit" className="button-primary w-100" disabled={isCheckingOut}>
                  {isCheckingOut ? 'Placing order…' : `Place order · ${formatCurrency(cart.total)}`}
                </Button>
              </Form>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
