const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

function parseGenres(a) {
  try { return { ...a, genres: JSON.parse(a.genres || '[]') }; } catch { return { ...a, genres: [] }; }
}

// GET /api/anime — list with search/filter/pagination
router.get('/', (req, res) => {
  const { search, genre, type, sort = 'rating', page = 1, limit = 24 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const where = []; const params = [];

  if (search) {
    where.push('(LOWER(a.title) LIKE ? OR LOWER(COALESCE(a.title_english,"")) LIKE ?)');
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  if (genre) { where.push('a.genres LIKE ?'); params.push(`%"${genre}"%`); }
  if (type)  { where.push('a.type = ?'); params.push(type); }

  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderMap = { rating: 'a.rating DESC', year: 'a.year DESC', title: 'a.title ASC' };
  const order = orderMap[sort] || 'a.rating DESC';

  try {
    const total = db.prepare(`SELECT COUNT(*) as c FROM anime a ${w}`).get(...params).c;
    const rows = db.prepare(
      `SELECT a.*, (SELECT COUNT(*) FROM seasons s WHERE s.anime_id = a.id) as season_count
       FROM anime a ${w} ORDER BY ${order} LIMIT ? OFFSET ?`
    ).all(...params, Number(limit), offset);
    res.json({ data: rows.map(parseGenres), pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/anime/trending
router.get('/trending', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM anime ORDER BY rating DESC LIMIT 20').all();
    res.json(rows.map(parseGenres));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/anime/genres
router.get('/genres', (req, res) => {
  try {
    const rows = db.prepare('SELECT genres FROM anime').all();
    const set = new Set();
    rows.forEach(r => { try { JSON.parse(r.genres || '[]').forEach(g => set.add(g)); } catch {} });
    res.json([...set].sort());
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/anime/by-genre/:genre
router.get('/by-genre/:genre', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM anime WHERE genres LIKE ? ORDER BY rating DESC LIMIT 20`)
      .all(`%"${req.params.genre}"%`);
    res.json(rows.map(parseGenres));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/anime/:id
router.get('/:id', (req, res) => {
  try {
    const anime = db.prepare('SELECT * FROM anime WHERE id = ?').get(req.params.id);
    if (!anime) return res.status(404).json({ error: 'Anime not found' });
    const seasons = db.prepare('SELECT * FROM seasons WHERE anime_id = ? ORDER BY season_number').all(anime.id);
    res.json({ ...parseGenres(anime), seasons });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
