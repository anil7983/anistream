const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

function parseGenres(a) {
  try { return { ...a, genres: JSON.parse(a.genres || '[]') }; } catch { return { ...a, genres: [] }; }
}

// GET /api/user/watchlist
router.get('/watchlist', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT a.*, w.created_at as added_at FROM watchlist w
      JOIN anime a ON a.id = w.anime_id WHERE w.user_id = ?
      ORDER BY w.created_at DESC`).all(req.user.id);
    res.json(rows.map(parseGenres));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/user/watchlist/check/:anime_id
router.get('/watchlist/check/:anime_id', (req, res) => {
  try {
    const item = db.prepare('SELECT id FROM watchlist WHERE user_id=? AND anime_id=?')
      .get(req.user.id, req.params.anime_id);
    res.json({ inWatchlist: !!item });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/user/watchlist/:anime_id
router.post('/watchlist/:anime_id', (req, res) => {
  try {
    db.prepare('INSERT OR IGNORE INTO watchlist (user_id, anime_id) VALUES (?,?)').run(req.user.id, req.params.anime_id);
    res.json({ success: true, message: 'Added to watchlist' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/user/watchlist/:anime_id
router.delete('/watchlist/:anime_id', (req, res) => {
  try {
    db.prepare('DELETE FROM watchlist WHERE user_id=? AND anime_id=?').run(req.user.id, req.params.anime_id);
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/user/history
router.get('/history', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT h.*, a.title, a.cover_image, a.title_english FROM watch_history h
      JOIN anime a ON a.id = h.anime_id WHERE h.user_id = ?
      ORDER BY h.watched_at DESC LIMIT 30`).all(req.user.id);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/user/history
router.post('/history', (req, res) => {
  const { anime_id, season_number = 1, episode_number = 1 } = req.body;
  try {
    db.prepare(`INSERT INTO watch_history (user_id, anime_id, season_number, episode_number) VALUES (?,?,?,?)`)
      .run(req.user.id, anime_id, season_number, episode_number);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
