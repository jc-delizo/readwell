import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import emptybag from '../assets/emptybag.svg';
import Loading from '../components/Loading';
import { api } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';

const itemDetails = (item) => {
  const currentBook = item.book && typeof item.book === 'object' ? item.book : {};
  return {
    id: currentBook._id || item.book || item._id,
    name: currentBook.name || item.name || 'Book no longer in catalog',
    author: currentBook.author || item.author || '',
    image: currentBook.image || item.image || '',
    price: item.price ?? currentBook.price ?? 0,
  };
};

export default function Orders() {
  const [now] = useState(() => Date.now());
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyOrder, setBusyOrder] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/booknook/order/retrieve-a-user-order', { signal: controller.signal })
      .then(setOrders)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const cancelOrder = async (order) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Cancel this order?',
      text: 'This cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Cancel order',
      confirmButtonColor: '#b42318',
    });
    if (!confirmation.isConfirmed) return;

    setBusyOrder(order._id);
    setError('');
    try {
      await api(`/booknook/order/delete-order/${order._id}`, { method: 'DELETE' });
      setOrders((current) => current.filter((item) => item._id !== order._id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyOrder('');
    }
  };

  if (isLoading) return <Loading label="Loading your orders" fullPage />;

  return (
    <div className="page-shell orders-page">
      <Container>
        <header className="page-heading page-heading--compact">
          <span className="eyebrow">From cart to doorstep</span>
          <h1>My orders</h1>
        </header>
        {error && <Alert variant="danger">{error}</Alert>}

        {!orders.length ? (
          <div className="empty-state">
            <img src={emptybag} alt="An empty order bag" />
            <h2>No orders yet.</h2>
            <p>When a book catches your eye, it will begin its journey here.</p>
            <Button as={Link} to="/books" className="button-primary">Find a book</Button>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => {
              const withinCancellationWindow =
                !order.isDelivered && now - new Date(order.createdOn).getTime() <= 12 * 60 * 60 * 1_000;
              const deliveryStart = new Date(new Date(order.createdOn).getTime() + 3 * 86_400_000);
              const deliveryEnd = new Date(new Date(order.createdOn).getTime() + 5 * 86_400_000);

              return (
                <Card className="order-card" key={order._id}>
                  <div className="order-card__header">
                    <div><span>Order placed</span><strong>{formatDate(order.createdOn)}</strong></div>
                    <div><span>Total</span><strong>{formatCurrency(order.totalPrice)}</strong></div>
                    <div className="order-card__id"><span>Order</span><strong>#{order._id.slice(-8).toUpperCase()}</strong></div>
                  </div>
                  <div className="order-card__body">
                    <div>
                      <span className={`status-pill ${order.isDelivered ? 'status-pill--success' : ''}`}>
                        {order.isDelivered ? 'Delivered' : 'Preparing your order'}
                      </span>
                      {!order.isDelivered && (
                        <p className="delivery-estimate">Estimated delivery {formatDate(deliveryStart)}–{formatDate(deliveryEnd)}</p>
                      )}
                      {order.books.map((item) => {
                        const details = itemDetails(item);
                        return (
                          <div className="order-item" key={item._id}>
                            {details.image ? <img src={details.image} alt={`Cover of ${details.name}`} /> : <FaBoxOpen />}
                            <div><strong>{details.name}</strong><span>{details.author}</span><span>Qty {item.quantity} · {formatCurrency(details.price)}</span></div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="order-card__aside">
                      <p><span>Deliver to</span><strong>{order.shippingAddress}</strong></p>
                      <p><span>Payment</span><strong>Cash on delivery</strong></p>
                      {withinCancellationWindow && (
                        <Button
                          variant="outline-danger"
                          onClick={() => cancelOrder(order)}
                          disabled={busyOrder === order._id}
                        >{busyOrder === order._id ? 'Cancelling…' : 'Cancel order'}</Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
