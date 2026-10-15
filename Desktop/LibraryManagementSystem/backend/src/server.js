require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const authorRoutes = require('./routes/authors');
const categoryRoutes = require('./routes/categories');
const historyRoutes = require('./routes/history');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ message: 'Server and MySQL connected successfully' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.use((error, _req, res, _next) => {
  if (error && (error.name === 'MulterError' || error.message === 'Only PDF files are allowed')) {
    return res.status(400).json({ message: error.message || 'Invalid upload' });
  }
  console.error('Unhandled server error:', error);
  res.status(500).json({ message: 'Unexpected server error' });
});

async function start() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS download_history (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      book_id INT NULL,
      book_title VARCHAR(255) NOT NULL,
      downloaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_history_user (user_id),
      INDEX idx_history_book (book_id),
      INDEX idx_history_date (downloaded_at)
    )`);
    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Could not start server. Check database settings:', error.message);
    process.exit(1);
  }
}
start();
