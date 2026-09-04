import { Button, Container } from 'react-bootstrap';
import { FaBookOpen } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <Container className="not-found-page">
      <FaBookOpen aria-hidden="true" />
      <span className="eyebrow">Error 404</span>
      <h1>This page fell out of the story.</h1>
      <p>Let’s get you back to a shelf you know.</p>
      <Button as={Link} to="/" className="button-primary">Return home</Button>
    </Container>
  );
}
