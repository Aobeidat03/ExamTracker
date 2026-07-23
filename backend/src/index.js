require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow the configured frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing — cap at 10 kb to reduce DoS risk
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

// Create database tables on startup if they don't exist yet.
// Safe to run every boot (uses IF NOT EXISTS).
const initDb = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(255)        NOT NULL,
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255)        NOT NULL,
      created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS exams (
      id         SERIAL  PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course     VARCHAR(255) NOT NULL,
      course_id  VARCHAR(50)  NOT NULL,
      day        VARCHAR(20)  NOT NULL,
      time       VARCHAR(20)  NOT NULL,
      room       VARCHAR(100) NOT NULL,
      date       DATE         NOT NULL,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
    CREATE INDEX IF NOT EXISTS idx_exams_date    ON exams(date);
  `);
};

const PORT = process.env.PORT || 5000;

// Try to create tables, then start the server either way so the
// service stays up and logs any database problem clearly.
initDb()
  .then(() => console.log('Database ready (tables ensured).'))
  .catch((err) => console.error('Database init failed:', err.message))
  .finally(() => {
    app.listen(PORT, () =>
      console.log(
        `Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`
      )
    );
  });

module.exports = app;
