/**
 * Seed script using better-sqlite3
 * Run: node seed/seed.js
 */
const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../db/anime.db');
const db = new Database(dbPath);

db.exec(`PRAGMA journal_mode=WAL;`);
db.exec(`PRAGMA foreign_keys=ON;`);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL, username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, avatar TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS anime (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mal_id INTEGER UNIQUE, title TEXT NOT NULL, title_english TEXT,
    synopsis TEXT, cover_image TEXT, banner_image TEXT, rating REAL DEFAULT 0.0,
    episodes_count INTEGER DEFAULT 0, status TEXT DEFAULT 'Unknown',
    year INTEGER, genres TEXT DEFAULT '[]', type TEXT DEFAULT 'TV',
    trailer_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anime_id INTEGER NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL DEFAULT 1,
    title TEXT, stream_url TEXT, episode_count INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anime_id INTEGER NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, anime_id)
  );
  CREATE TABLE IF NOT EXISTS watch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anime_id INTEGER NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    season_number INTEGER DEFAULT 1, episode_number INTEGER DEFAULT 1,
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── Anime data with official YouTube playlist embed URLs ─────────────────────
// Sources: Muse Asia (India), VIZ Media (global), Crunchyroll, Toei Animation
const ANIME_DATA = [
  { mal_id: 1535,  seasons: [{ n:1, t:'Full Series',    eps:37,  url:'https://www.youtube.com/embed/videoseries?list=PLVoPMpPxQIFBgzHVOvzqnIp0bgDAofrC8&autoplay=1' }] },
  { mal_id: 20,    seasons: [{ n:1, t:'Classic Series', eps:220, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYky4bNGxvMrNV0zLJ5o5iFI&autoplay=1' }] },
  { mal_id: 16498, seasons: [
      { n:1, t:'Season 1', eps:25, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYmC4FpCYz6u63uPHmBGWSdz&autoplay=1' },
      { n:2, t:'Season 2', eps:12, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYkWdHMaGqN1Y3_JNxO7rjXo&autoplay=1' },
  ]},
  { mal_id: 11757, seasons: [
      { n:1, t:'Aincrad Arc',  eps:25, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkuiU5-PZoOWYv9ZqhIMHuVl&autoplay=1' },
      { n:2, t:'SAO II',       eps:24, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAksZWR6H7MPlzXZCkbRQvVf0&autoplay=1' },
  ]},
  { mal_id: 37430, seasons: [
      { n:1, t:'Season 1', eps:24, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkviGSJFRCZtY-FPQl6GRPT6&autoplay=1' },
      { n:2, t:'Season 2', eps:24, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkunTfJhXKtUZGKpjAvFBNKC&autoplay=1' },
  ]},
  { mal_id: 31240, seasons: [
      { n:1, t:'Season 1', eps:25, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAksJoxUCLNBRDQ9bWYvFDUJF&autoplay=1' },
      { n:2, t:'Season 2', eps:25, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAktD9YYfKnXjKzreBhWfVsGt&autoplay=1' },
  ]},
  { mal_id: 29803, seasons: [
      { n:1, t:'Season 1', eps:13, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkuA9-TfkJALcCgS0RoiMKt6&autoplay=1' },
      { n:2, t:'Season 2', eps:13, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkvy2ZsqMhTd0HVtf_pO6x0f&autoplay=1' },
      { n:3, t:'Season 3', eps:13, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAksNsSnLqg8v0Yer7vRLJn2k&autoplay=1' },
  ]},
  { mal_id: 19815, seasons: [{ n:1, t:'Season 1', eps:12, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAktiDGGqcSSDplJDhLKpNFUF&autoplay=1' }] },
  { mal_id: 30831, seasons: [
      { n:1, t:'Season 1', eps:10, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkuqj4JVNR7fJ8lQMdxuSCMw&autoplay=1' },
      { n:2, t:'Season 2', eps:10, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAksgHarJxiDKPvk0w2Lp7L_F&autoplay=1' },
  ]},
  { mal_id: 35790, seasons: [
      { n:1, t:'Season 1', eps:25, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAksJVMhGvlHXPIbRZ_BSCA8W&autoplay=1' },
      { n:2, t:'Season 2', eps:13, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkv0oLzqV2HxDrUi2-g8Wkx5&autoplay=1' },
  ]},
  { mal_id: 5114,  seasons: [{ n:1, t:'Full Series', eps:64,  url:'https://www.youtube.com/embed/videoseries?list=PLlAFpZUkuFWbUTa5T-URSVtNQ2U2DUXBA&autoplay=1' }] },
  { mal_id: 11061, seasons: [{ n:1, t:'Full Series', eps:148, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYmPFTyLEeFJhHUuOSmP1d-s&autoplay=1' }] },
  { mal_id: 269,   seasons: [{ n:1, t:'Full Series', eps:366, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYmjphXrCGqeVVxfDFPpeSaT&autoplay=1' }] },
  { mal_id: 21,    seasons: [{ n:1, t:'East Blue Arc', eps:61, url:'https://www.youtube.com/embed/videoseries?list=PLh4A3m8U-R3i1bJ-R4LgSpPM4aNYp5dWS&autoplay=1' }] },
  { mal_id: 38000, seasons: [
      { n:1, t:'Season 1', eps:26, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYnlJCjrBKR1gDq6xZSHYNOC&autoplay=1' },
  ]},
  { mal_id: 31964, seasons: [
      { n:1, t:'Season 1', eps:13, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYlQMZeXmQvjFVjWnB9iAeJ-&autoplay=1' },
      { n:2, t:'Season 2', eps:25, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYlHM_uXbgKALjTHSU7Tme4u&autoplay=1' },
  ]},
  { mal_id: 34572, seasons: [{ n:1, t:'Full Series', eps:170, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYlAjOJXLFGzW6VoCuMW2WTG&autoplay=1' }] },
  { mal_id: 50265, seasons: [
      { n:1, t:'Part 1', eps:12, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYnYurGsGG6JAiOklHOJoODZ&autoplay=1' },
  ]},
  { mal_id: 37521, seasons: [
      { n:1, t:'Season 1', eps:24, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkuMZoQDkRNHIoMJBh-cZxwg&autoplay=1' },
      { n:2, t:'Season 2', eps:24, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAks7N69sj7KJJOfzpGFvjX6d&autoplay=1' },
  ]},
  { mal_id: 44511, seasons: [{ n:1, t:'Season 1', eps:12, url:'https://www.youtube.com/embed/videoseries?list=PLp4UARSvByYnMeOrEgmVx0ePjJZgIbxzM&autoplay=1' }] },
  { mal_id: 6702,  seasons: [{ n:1, t:'Full Series', eps:175, url:'https://www.youtube.com/embed/videoseries?list=PLzDu7Pk7rAkuUfMqAbHiT0oJWlwmNLerq&autoplay=1' }] },
];

const insertAnime = db.prepare(`
  INSERT OR REPLACE INTO anime
  (mal_id, title, title_english, synopsis, cover_image, banner_image, rating, episodes_count, status, year, genres, type, trailer_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertSeason = db.prepare(`
  INSERT INTO seasons (anime_id, season_number, title, stream_url, episode_count)
  VALUES (?, ?, ?, ?, ?)
`);

async function seed() {
  console.log(`\n🌱 Seeding ${ANIME_DATA.length} anime from Jikan API...\n`);

  for (const entry of ANIME_DATA) {
    process.stdout.write(`  Fetching MAL #${entry.mal_id}... `);
    try {
      const { data: { data } } = await axios.get(`https://api.jikan.moe/v4/anime/${entry.mal_id}`);
      const genres = (data.genres || []).map(g => g.name);
      const result = insertAnime.run(
        entry.mal_id,
        data.title || 'Unknown',
        data.title_english || data.title,
        data.synopsis || '',
        data.images?.jpg?.large_image_url || '',
        data.images?.jpg?.large_image_url || '',
        data.score || 0,
        data.episodes || 0,
        data.status || 'Unknown',
        data.year || (data.aired?.from ? new Date(data.aired.from).getFullYear() : null),
        JSON.stringify(genres),
        data.type || 'TV',
        data.trailer?.url || null
      );
      const animeId = result.lastInsertRowid || db.prepare('SELECT id FROM anime WHERE mal_id=?').get(entry.mal_id)?.id;
      db.prepare('DELETE FROM seasons WHERE anime_id=?').run(animeId);
      for (const s of entry.seasons) insertSeason.run(animeId, s.n, s.t, s.url, s.eps);
      console.log(`✅ ${data.title_english || data.title}`);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  const total = db.prepare('SELECT COUNT(*) as c FROM anime').get().c;
  const seasons = db.prepare('SELECT COUNT(*) as c FROM seasons').get().c;
  console.log(`\n✨ Done! ${total} anime, ${seasons} seasons seeded.\n`);
  db.close();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
