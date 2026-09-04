import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { FaUserShield } from 'react-icons/fa6';
import UserContext from '../UserContext';
import Loading from '../components/Loading';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';

const initials = (name = '') => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export default function Users() {
  const { user: currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/booknook/users/all', { signal: controller.signal })
      .then(setUsers)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visibleUsers = useMemo(() => {
    const term = search.toLowerCase().trim();
    return users.filter((account) => !term || `${account.name} ${account.email}`.toLowerCase().includes(term));
  }, [search, users]);

  const toggleRole = async (account) => {
    setBusy(account._id);
    setError('');
    try {
      const action = account.isAdmin ? 'makeuser' : 'makeadmin';
      const result = await api(`/booknook/users/${action}/${account._id}`, { method: 'PUT' });
      setUsers((current) => current.map((item) => item._id === result.user._id ? result.user : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  if (isLoading) return <Loading label="Loading customers" fullPage />;

  return (
    <div className="page-shell admin-page">
      <Container>
        <header className="admin-heading"><div><span className="eyebrow">Administrator</span><h1>Customers</h1><p>Review accounts and assign catalog access.</p></div></header>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="admin-filters admin-filters--users">
          <Form.Control type="search" placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <p className="result-count">{visibleUsers.length} accounts</p>

        <div className="user-grid">
          {visibleUsers.map((account) => (
            <article className="user-card" key={account._id}>
              <div className="user-card__avatar">{initials(account.name)}</div>
              <div className="user-card__identity">
                <h2>{account.name} {account.isAdmin && <FaUserShield title="Administrator" />}</h2>
                <a href={`mailto:${account.email}`}>{account.email}</a>
                <span>{account.mobileNo}</span>
                <small>Joined {formatDate(account.createdOn)}</small>
              </div>
              <Button
                variant={account.isAdmin ? 'outline-danger' : 'outline-success'}
                onClick={() => toggleRole(account)}
                disabled={busy === account._id || currentUser.id === account._id}
              >{currentUser.id === account._id ? 'Current account' : busy === account._id ? 'Updating…' : account.isAdmin ? 'Remove admin' : 'Make admin'}</Button>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
