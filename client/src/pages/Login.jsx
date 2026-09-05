import { useContext, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import readwell from '../assets/readwell.svg';
import { api } from '../lib/api';

export default function Login() {
  const { user, signIn } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user.id) return <Navigate to="/books" replace />;

  const authenticate = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await api('/booknook/users/login', {
        method: 'POST',
        token: null,
        body: { email, password },
      });
      signIn(result.access, result.user);
      navigate(location.state?.from || '/books', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__art" aria-hidden="true">
        <div className="auth-page__quote">
          <span>Read slowly.</span>
          <strong>Wonder often.</strong>
        </div>
      </div>
      <div className="auth-page__panel">
        <div className="auth-card">
          <Link to="/" className="auth-card__brand" aria-label="ReadWell home">
            <img src={readwell} alt="ReadWell" />
          </Link>
          <span className="eyebrow">Welcome back</span>
          <h1>Return to your reading nook.</h1>
          <p>Sign in to see your cart and track your orders.</p>

          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={authenticate}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </Form.Group>
            <Button type="submit" className="button-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>
          <p className="auth-card__switch">New to ReadWell? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
