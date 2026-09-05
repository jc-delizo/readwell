import { useContext, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import readwell from '../assets/readwell.svg';
import { api } from '../lib/api';

export default function Register() {
  const { user, signIn } = useContext(UserContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mobileNo: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user.id) return <Navigate to="/books" replace />;

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const register = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api('/booknook/users/register', {
        method: 'POST',
        token: null,
        body: {
          name: form.name,
          mobileNo: form.mobileNo,
          email: form.email,
          password: form.password,
        },
      });
      signIn(result.access, result.user);
      navigate('/books', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-page__art" aria-hidden="true">
        <div className="auth-page__quote"><span>Build a shelf.</span><strong>Build a life.</strong></div>
      </div>
      <div className="auth-page__panel">
        <div className="auth-card">
          <Link to="/" className="auth-card__brand" aria-label="ReadWell home">
            <img src={readwell} alt="ReadWell" />
          </Link>
          <span className="eyebrow">Join the community</span>
          <h1>Make room for your next favorite.</h1>
          <p>Create an account to save a cart and place orders.</p>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={register}>
            <Form.Group className="mb-3" controlId="register-name">
              <Form.Label>Full name</Form.Label>
              <Form.Control name="name" value={form.name} onChange={update} autoComplete="name" minLength={2} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="register-mobile">
              <Form.Label>Mobile number</Form.Label>
              <Form.Control name="mobileNo" type="tel" value={form.mobileNo} onChange={update} autoComplete="tel" minLength={7} maxLength={20} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="register-email">
              <Form.Label>Email address</Form.Label>
              <Form.Control name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
            </Form.Group>
            <div className="auth-card__row">
              <Form.Group controlId="register-password">
                <Form.Label>Password</Form.Label>
                <Form.Control name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" minLength={8} maxLength={72} required />
              </Form.Group>
              <Form.Group controlId="register-confirm-password">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} autoComplete="new-password" required />
              </Form.Group>
            </div>
            <Button type="submit" className="button-primary w-100 mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </Form>
          <p className="auth-card__switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
