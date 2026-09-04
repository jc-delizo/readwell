import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { FaBox } from 'react-icons/fa6';
import Loading from '../components/Loading';
import { api } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';

const bookName = (item) =>
  (item.book && typeof item.book === 'object' ? item.book.name : '') || item.name || 'Removed book';

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/booknook/order/get-orders', { signal: controller.signal })
      .then(setOrders)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visibleOrders = useMemo(() => {
    const term = search.toLowerCase().trim();
    return orders.filter((order) => {
      const matchesState = filter === 'all' || (filter === 'delivered' ? order.isDelivered : !order.isDelivered);
      const searchable = `${order._id} ${order.user?.name || ''} ${order.user?.email || ''}`.toLowerCase();
      return matchesState && (!term || searchable.includes(term));
    });
  }, [filter, orders, search]);

  const setDelivered = async (order, isDelivered) => {
    setBusy(order._id);
    setError('');
    try {
      const updated = await api(`/booknook/order/order-delivered/${order._id}`, {
        method: 'PUT',
        body: { isDelivered },
      });
      setOrders((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  if (isLoading) return <Loading label="Loading orders" fullPage />;

  return (
    <div className="page-shell admin-page">
      <Container>
        <header className="admin-heading"><div><span className="eyebrow">Administrator</span><h1>Orders</h1><p>Track fulfillment across every customer.</p></div></header>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="admin-filters admin-filters--orders">
          <Form.Control type="search" placeholder="Search customer, email, or order ID" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Form.Select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter orders">
            <option value="pending">Pending</option><option value="delivered">Delivered</option><option value="all">All orders</option>
          </Form.Select>
        </div>
        <p className="result-count">{visibleOrders.length} orders</p>

        <div className="admin-order-grid">
          {visibleOrders.map((order) => (
            <Card className="admin-order-card" key={order._id}>
              <Card.Body>
                <div className="admin-order-card__top">
                  <span className={`status-pill ${order.isDelivered ? 'status-pill--success' : ''}`}>{order.isDelivered ? 'Delivered' : 'Pending'}</span>
                  <span>{formatDate(order.createdOn)}</span>
                </div>
                <h2>{order.user?.name || 'Deleted customer'}</h2>
                <p>{order.user?.email}</p>
                <div className="admin-order-card__books">
                  {order.books.map((item) => <span key={item._id}><FaBox /> {item.quantity} × {bookName(item)}</span>)}
                </div>
                <dl><div><dt>Total</dt><dd>{formatCurrency(order.totalPrice)}</dd></div><div><dt>Deliver to</dt><dd>{order.shippingAddress}</dd></div><div><dt>Order</dt><dd>#{order._id.slice(-8).toUpperCase()}</dd></div></dl>
              </Card.Body>
              <Button
                variant={order.isDelivered ? 'outline-secondary' : 'success'}
                onClick={() => setDelivered(order, !order.isDelivered)}
                disabled={busy === order._id}
              >{busy === order._id ? 'Updating…' : order.isDelivered ? 'Mark pending' : 'Mark delivered'}</Button>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
