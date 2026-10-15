const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT a.id, a.name, COUNT(b.id) AS book_count FROM authors a LEFT JOIN books b ON b.author_id = a.id GROUP BY a.id, a.name ORDER BY a.name`);
    res.json(rows);
  } catch (error) {
    console.error('Fetch authors failed:', error.message);
    res.status(500).json({ message: 'Could not load authors' });
  }
});

router.post('/', auth, admin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Author name is required' });
    const [existing] = await db.query('SELECT id FROM authors WHERE LOWER(name) = LOWER(?) LIMIT 1', [name]);
    if (existing.length) return res.status(409).json({ message: 'This author already exists' });
    const [result] = await db.query('INSERT INTO authors (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name, message: 'Author added successfully' });
  } catch (error) {
    console.error('Add author failed:', error.message);
    res.status(500).json({ message: 'Could not add author' });
  }
});

router.put('/:id', auth, admin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Author name is required' });
    const [dupes] = await db.query('SELECT id FROM authors WHERE LOWER(name) = LOWER(?) AND id <> ?', [name, req.params.id]);
    if (dupes.length) return res.status(409).json({ message: 'This author already exists' });
    const [result] = await db.query('UPDATE authors SET name = ? WHERE id = ?', [name, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Author not found' });
    res.json({ message: 'Author updated successfully' });
  } catch (error) {
    console.error('Update author failed:', error.message);
    res.status(500).json({ message: 'Could not update author' });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const [used] = await db.query('SELECT COUNT(*) AS count FROM books WHERE author_id = ?', [req.params.id]);
    if (Number(used[0].count) > 0) return res.status(409).json({ message: 'This author is assigned to books. Reassign those books first.' });
    const [result] = await db.query('DELETE FROM authors WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Author not found' });
    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Delete author failed:', error.message);
    res.status(500).json({ message: 'Could not delete author' });
  }
});

module.exports = router;
