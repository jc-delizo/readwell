const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
  boundedInteger,
  boundedNumber,
  email,
  escapeRegExp,
  positiveNumber,
  quantity,
} = require('../utils/validation');

describe('request validation', () => {
  it('normalizes email addresses', () => {
    assert.equal(email(' Reader@Example.COM '), 'reader@example.com');
  });

  it('rejects invalid quantities', () => {
    assert.throws(() => quantity(-1), /Quantity/);
    assert.throws(() => quantity(1.5), /Quantity/);
    assert.equal(quantity(3), 3);
  });

  it('normalizes monetary values to cents', () => {
    assert.equal(positiveNumber('149.999', 'Price'), 150);
  });

  it('validates bounded ratings and whole-number rating counts', () => {
    assert.equal(boundedNumber('4.74', 'Rating', { min: 1, max: 5, precision: 1 }), 4.7);
    assert.equal(boundedInteger('1284', 'Rating count', { min: 0, max: 1_000_000 }), 1284);
    assert.throws(
      () => boundedNumber(5.1, 'Rating', { min: 1, max: 5, precision: 1 }),
      /Rating must be a number from 1 to 5/,
    );
    assert.throws(
      () => boundedInteger(1.5, 'Rating count', { min: 0, max: 1_000_000 }),
      /Rating count must be an integer/,
    );
  });

  it('escapes regular-expression input', () => {
    assert.equal(escapeRegExp('book.*(sale)'), 'book\\.\\*\\(sale\\)');
  });
});
