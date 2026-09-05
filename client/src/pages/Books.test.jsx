import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api';
import Books from './Books';

vi.mock('../lib/api', () => ({ api: vi.fn() }));

const books = Array.from({ length: 25 }, (_, index) => ({
  _id: `book-${index + 1}`,
  name: `Catalog Book ${index + 1}`,
  author: 'Demo Author',
  genre: 'Fiction',
  description: 'A book used to verify catalog pagination.',
  image: 'https://example.com/cover.jpg',
  price: 499,
  createdOn: new Date(2026, 0, index + 1).toISOString(),
}));

describe('Books', () => {
  beforeEach(() => api.mockResolvedValue(books));

  it('loads the expanded catalog and paginates it in groups of 24', async () => {
    render(<MemoryRouter><Books /></MemoryRouter>);

    expect(await screen.findByText('Showing 1–24 of 25 books')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith(
      '/booknook/books/activebooks?limit=500',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    fireEvent.click(screen.getByText('2', { selector: '.page-link' }));

    expect(screen.getByText('Showing 25–25 of 25 books')).toBeInTheDocument();
    expect(screen.getByText('Catalog Book 1')).toBeInTheDocument();
    expect(screen.queryByText('Catalog Book 25')).not.toBeInTheDocument();
  });
});
