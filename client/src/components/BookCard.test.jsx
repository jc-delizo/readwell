import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BookCard from './BookCard';

const book = {
  _id: 'book-123',
  name: 'The Quiet Library',
  author: 'A. Reader',
  genre: 'Fiction',
  description: 'A thoughtful story about finding a place to belong.',
  image: 'https://example.com/cover.jpg',
  price: 499,
};

describe('BookCard', () => {
  it('links to the book and presents its essential details', () => {
    render(<MemoryRouter><BookCard book={book} /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /the quiet library/i })).toHaveAttribute(
      'href',
      '/bookpage/book-123',
    );
    expect(screen.getByText('by A. Reader')).toBeInTheDocument();
    expect(screen.getByText(/₱499\.00/)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName('Cover of The Quiet Library');
  });
});
