const fs = require('node:fs');
const path = require('node:path');
const cors = require('cors');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: process.env.NODE_ENV === 'test' ? 10_000 : 500,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);
app.use(
  ['/booknook/users/login', '/booknook/users/register'],
  rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: process.env.NODE_ENV === 'test' ? 10_000 : 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again later.' },
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/booknook/books', require('./routes/bookRoutes'));
app.use('/booknook/users', require('./routes/userRoutes'));
app.use('/booknook/cart', require('./routes/cartRoutes'));
app.use('/booknook/order', require('./routes/orderRoutes'));

app.use('/api', notFound);
app.use('/booknook', notFound);

const clientDirectory = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(path.join(clientDirectory, 'index.html'))) {
  app.use(express.static(clientDirectory, { maxAge: '1d', index: false }));
  app.get('/{*route}', (_req, res) => {
    res.sendFile(path.join(clientDirectory, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
