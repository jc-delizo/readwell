const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
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

  it('escapes regular-expression input', () => {
    assert.equal(escapeRegExp('book.*(sale)'), 'book\\.\\*\\(sale\\)');
  });
});
