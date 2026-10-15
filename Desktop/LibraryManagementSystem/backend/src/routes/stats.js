const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/', auth, admin, async (_req, res) => {
  try {
    const [[books]] = await db.query('SELECT COUNT(*) AS total FROM books');
    const [[authors]] = await db.query('SELECT COUNT(*) AS total FROM authors');
    const [[categories]] = await db.query('SELECT COUNT(*) AS total FROM categories');
    const [[users]] = await db.query('SELECT COUNT(*) AS total FROM users');
    const [[downloads]] = await db.query('SELECT COUNT(*) AS total FROM download_history');
    const [recent] = await db.query(
      `SELECT book_title, downloaded_at, user_id FROM download_history ORDER BY downloaded_at DESC LIMIT 5`
    );
    res.json({
      books: Number(books.total), authors: Number(authors.total),
      categories: Number(categories.total), users: Number(users.total),
      downloads: Number(downloads.total), recentDownloads: recent
    });
  } catch (error) {
    console.error('Dashboard stats failed:', error.message);
    res.status(500).json({ message: 'Could not load dashboard statistics' });
  }
});

module.exports = router;
