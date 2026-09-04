import { Spinner } from 'react-bootstrap';

export default function Loading({ label = 'Loading', fullPage = false }) {
  return (
    <div className={`loading-state${fullPage ? ' loading-state--page' : ''}`} role="status">
      <Spinner animation="border" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}
