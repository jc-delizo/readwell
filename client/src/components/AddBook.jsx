import { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { api } from '../lib/api';

const initialBook = {
  name: '',
  author: '',
  genre: '',
  description: '',
  image: '',
  price: '',
  rating: '4.5',
  reviewCount: '0',
};

export default function AddBook({ show, onClose, onBookAdded }) {
  const [book, setBook] = useState(initialBook);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const update = (event) => setBook((current) => ({ ...current, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const result = await api('/booknook/books/add-book', {
        method: 'POST',
        body: {
          ...book,
          price: Number(book.price),
          rating: Number(book.rating),
          reviewCount: Number(book.reviewCount),
        },
      });
      onBookAdded(result.book);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Form onSubmit={save}>
        <Modal.Header closeButton><Modal.Title>Add a book</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="form-grid">
            <Form.Group controlId="add-name"><Form.Label>Title</Form.Label><Form.Control name="name" value={book.name} onChange={update} maxLength={160} required /></Form.Group>
            <Form.Group controlId="add-author"><Form.Label>Author</Form.Label><Form.Control name="author" value={book.author} onChange={update} maxLength={120} required /></Form.Group>
            <Form.Group controlId="add-genre"><Form.Label>Genre</Form.Label><Form.Control name="genre" value={book.genre} onChange={update} maxLength={80} required /></Form.Group>
            <Form.Group controlId="add-price"><Form.Label>Price (PHP)</Form.Label><Form.Control name="price" type="number" min="0.01" step="0.01" value={book.price} onChange={update} required /></Form.Group>
            <Form.Group controlId="add-rating"><Form.Label>Rating (1–5)</Form.Label><Form.Control name="rating" type="number" min="1" max="5" step="0.1" value={book.rating} onChange={update} required /></Form.Group>
            <Form.Group controlId="add-review-count"><Form.Label>Rating count</Form.Label><Form.Control name="reviewCount" type="number" min="0" max="1000000" step="1" value={book.reviewCount} onChange={update} required /></Form.Group>
            <Form.Group className="form-grid__full" controlId="add-image"><Form.Label>Cover image URL</Form.Label><Form.Control name="image" type="url" value={book.image} onChange={update} maxLength={2000} required /></Form.Group>
            <Form.Group className="form-grid__full" controlId="add-description"><Form.Label>Description</Form.Label><Form.Control name="description" as="textarea" rows={5} value={book.description} onChange={update} maxLength={2000} required /></Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="button-primary" disabled={isSaving}>{isSaving ? 'Adding…' : 'Add book'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
