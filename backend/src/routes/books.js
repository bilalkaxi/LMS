const express = require('express');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const optionalAuth = require('../middleware/optionalAuth');
const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`)
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf' || path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

async function findOrCreateName(connection, table, name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  if (!['authors', 'categories'].includes(table)) throw new Error('Invalid lookup table');
  const [rows] = await connection.query(`SELECT id FROM ${table} WHERE LOWER(name) = LOWER(?) LIMIT 1`, [clean]);
  if (rows.length) return rows[0].id;
  const [result] = await connection.query(`INSERT INTO ${table} (name) VALUES (?)`, [clean]);
  return result.insertId;
}

const bookSelect = `SELECT b.id, b.title, b.description, b.isbn, b.created_at,
  a.name AS author, c.name AS category
  FROM books b LEFT JOIN authors a ON b.author_id = a.id
  LEFT JOIN categories c ON b.category_id = c.id`;

router.get('/', async (_req, res) => {
  try {
    const [books] = await db.query(`${bookSelect} ORDER BY b.id DESC`);
    res.json(books);
  } catch (error) {
    console.error('Fetch books failed:', error.message);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

router.get('/:id/download', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, title, pdf_path FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Book not found' });
    const book = rows[0];
    const filePath = path.resolve(__dirname, '../../', book.pdf_path);
    if (!filePath.startsWith(uploadDir + path.sep) || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }
    await db.query(
      'INSERT INTO download_history (user_id, book_id, book_title) VALUES (?, ?, ?)',
      [req.user?.id || null, book.id, book.title]
    );
    const safeName = book.title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 180) || 'book';
    res.download(filePath, `${safeName}.pdf`);
  } catch (error) {
    console.error('Download failed:', error.message);
    res.status(500).json({ message: 'Download failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [books] = await db.query(`${bookSelect} WHERE b.id = ?`, [req.params.id]);
    if (!books.length) return res.status(404).json({ message: 'Book not found' });
    res.json(books[0]);
  } catch (error) {
    console.error('Fetch book failed:', error.message);
    res.status(500).json({ message: 'Failed to fetch book' });
  }
});

router.post('/upload', auth, admin, upload.single('pdf'), async (req, res) => {
  let savedFile = null;
  let connection;
  try {
    const { title, description, isbn, author, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Book title is required' });
    if (!author?.trim()) return res.status(400).json({ message: 'Author name is required' });
    if (!category?.trim()) return res.status(400).json({ message: 'Category name is required' });
    if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
    savedFile = req.file.path;
    connection = await db.getConnection();
    await connection.beginTransaction();
    const authorId = await findOrCreateName(connection, 'authors', author);
    const categoryId = await findOrCreateName(connection, 'categories', category);
    const [result] = await connection.query(
      `INSERT INTO books (title, description, isbn, author_id, category_id, pdf_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title.trim(), description?.trim() || null, isbn?.trim() || null, authorId, categoryId, `uploads/${req.file.filename}`]
    );
    await connection.commit();
    res.status(201).json({ message: 'Book uploaded successfully', bookId: result.insertId });
  } catch (error) {
    if (connection) await connection.rollback();
    if (savedFile && fs.existsSync(savedFile)) fs.unlinkSync(savedFile);
    console.error('Upload failed:', error.message);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This ISBN already exists' });
    res.status(500).json({ message: 'Failed to upload book' });
  } finally {
    if (connection) connection.release();
  }
});

router.put('/:id', auth, admin, async (req, res) => {
  let connection;
  try {
    const { title, description, isbn, author, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Book title is required' });
    if (!author?.trim()) return res.status(400).json({ message: 'Author name is required' });
    if (!category?.trim()) return res.status(400).json({ message: 'Category name is required' });
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [existing] = await connection.query('SELECT id FROM books WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Book not found' });
    }
    const authorId = await findOrCreateName(connection, 'authors', author);
    const categoryId = await findOrCreateName(connection, 'categories', category);
    await connection.query(
      `UPDATE books SET title = ?, description = ?, isbn = ?, author_id = ?, category_id = ? WHERE id = ?`,
      [title.trim(), description?.trim() || null, isbn?.trim() || null, authorId, categoryId, req.params.id]
    );
    await connection.commit();
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Update book failed:', error.message);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This ISBN already exists' });
    res.status(500).json({ message: 'Failed to update book' });
  } finally {
    if (connection) connection.release();
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT pdf_path FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Book not found' });
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    const filePath = path.resolve(__dirname, '../../', rows[0].pdf_path);
    if (filePath.startsWith(uploadDir + path.sep) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book failed:', error.message);
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

module.exports = router;
