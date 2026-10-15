const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT c.id, c.name, COUNT(b.id) AS book_count FROM categories c LEFT JOIN books b ON b.category_id = c.id GROUP BY c.id, c.name ORDER BY c.name`);
    res.json(rows);
  } catch (error) {
    console.error('Fetch categories failed:', error.message);
    res.status(500).json({ message: 'Could not load categories' });
  }
});

router.post('/', auth, admin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const [existing] = await db.query('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1', [name]);
    if (existing.length) return res.status(409).json({ message: 'This category already exists' });
    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name, message: 'Category added successfully' });
  } catch (error) {
    console.error('Add category failed:', error.message);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This category already exists' });
    res.status(500).json({ message: 'Could not add category' });
  }
});

router.put('/:id', auth, admin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const [dupes] = await db.query('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id <> ?', [name, req.params.id]);
    if (dupes.length) return res.status(409).json({ message: 'This category already exists' });
    const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category failed:', error.message);
    res.status(500).json({ message: 'Could not update category' });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const [used] = await db.query('SELECT COUNT(*) AS count FROM books WHERE category_id = ?', [req.params.id]);
    if (Number(used[0].count) > 0) return res.status(409).json({ message: 'This category is assigned to books. Reassign those books first.' });
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category failed:', error.message);
    res.status(500).json({ message: 'Could not delete category' });
  }
});

module.exports = router;
