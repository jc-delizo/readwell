import { Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/format';

export default function BookCard({ book }) {
  return (
    <Card as={Link} to={`/bookpage/${book._id}`} className="book-card">
      <div className="book-card__image-wrap">
        <Card.Img src={book.image} alt={`Cover of ${book.name}`} className="book-card__image" />
        <Badge pill className="book-card__genre">{book.genre}</Badge>
      </div>
      <Card.Body className="book-card__body">
        <Card.Title className="book-card__title">{book.name}</Card.Title>
        <p className="book-card__author">by {book.author}</p>
        <Card.Text className="book-card__description">{book.description}</Card.Text>
        <div className="book-card__footer">
          <span className="book-card__price">{formatCurrency(book.price)}</span>
          <span className="book-card__link">View book →</span>
        </div>
      </Card.Body>
    </Card>
  );
}
