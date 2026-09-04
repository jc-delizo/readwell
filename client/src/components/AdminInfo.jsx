import { Modal } from 'react-bootstrap';

export default function AdminInfo({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton><Modal.Title>Catalog tips</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>Search by title or author, then narrow the list by genre or availability.</p>
        <p>Select <strong>Edit</strong> to update book details. Archiving keeps order history intact while hiding the book from shoppers.</p>
        <p>Permanent deletion cannot be undone from the app; archive a title unless you are certain it should be removed.</p>
      </Modal.Body>
    </Modal>
  );
}
