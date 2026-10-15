const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, book_title, downloaded_at FROM download_history WHERE user_id = ? ORDER BY downloaded_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('User history failed:', error.message);
    res.status(500).json({ message: 'Could not load your download history' });
  }
});

router.get('/', auth, admin, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT h.id, h.book_title, h.downloaded_at, u.name AS user_name, u.email AS user_email
       FROM download_history h LEFT JOIN users u ON u.id = h.user_id
       ORDER BY h.downloaded_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (error) {
    console.error('Admin history failed:', error.message);
    res.status(500).json({ message: 'Could not load download history' });
  }
});

module.exports = router;
