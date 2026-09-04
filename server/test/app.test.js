const assert = require('node:assert/strict');
const { before, describe, it } = require('node:test');
const request = require('supertest');

before(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
});

const app = require('../app');

describe('API shell', () => {
  it('reports health without requiring a database connection', async () => {
    const response = await request(app).get('/api/health').expect(200);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.body.database, 'disconnected');
    assert.ok(response.headers['x-content-type-options']);
  });

  it('rejects protected requests without a token', async () => {
    const response = await request(app)
      .get('/booknook/cart/view-cart')
      .expect(401);
    assert.equal(response.body.message, 'Authentication is required.');
  });

  it('validates login input before querying the database', async () => {
    const response = await request(app)
      .post('/booknook/users/login')
      .send({ email: 'not-an-email', password: '' })
      .expect(400);
    assert.match(response.body.message, /valid email/i);
  });

  it('returns a JSON 404 for unknown API routes', async () => {
    const response = await request(app).get('/api/unknown').expect(404);
    assert.match(response.body.message, /route not found/i);
  });
});
