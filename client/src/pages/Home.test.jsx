import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api';
import Home from './Home';

vi.mock('../lib/api', () => ({ api: vi.fn() }));

const catalog = [
  ['The Ballad of Never After', 'Fantasy'],
  ['In the Dream House', 'Memoir'],
  ['The Way of Kings', 'Fantasy'],
  ['The Little Prince', 'Classic'],
  ['Dune', 'Science Fiction'],
  ['Atomic Habits', 'Self Development'],
  ['The Midnight Library', 'Contemporary Fiction'],
].map(([name, genre], index) => ({
  _id: `book-${index}`,
  name,
  author: `Author ${index}`,
  genre,
  description: `${genre} description`,
  image: `https://example.com/cover-${index}.jpg`,
  price: 499,
  rating: 4.5,
  reviewCount: 100 + index,
}));

describe('Home', () => {
  beforeEach(() => api.mockResolvedValue(catalog));

  it('curates the hero and represents the full catalog across homepage sections', async () => {
    const { container } = render(<MemoryRouter><Home /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'New arrivals' })).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith(
      '/booknook/books/activebooks?limit=500',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    const hero = screen.getByLabelText('A selection of books at ReadWell');
    expect(within(hero).getAllByRole('img').map((image) => image.alt)).toEqual([
      'Cover of The Ballad of Never After',
      'Cover of In the Dream House',
      'Cover of The Way of Kings',
    ]);

    const arrivalCards = container.querySelectorAll('.section-space .book-card');
    const arrivalGenres = new Set(
      [...arrivalCards].map((card) => card.querySelector('.book-card__genre').textContent),
    );
    expect(arrivalCards).toHaveLength(4);
    expect(arrivalGenres.size).toBe(4);

    const moodSection = screen.getByText('Read by mood').closest('section');
    expect(within(moodSection).getAllByRole('link')).toHaveLength(6);
    expect(screen.getByText('© 2023 ReadWell by JC Delizo')).toBeInTheDocument();
  });
});
