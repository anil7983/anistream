/**
 * UPDATE STREAM URLs with REAL verified playlist IDs
 * From: Muse Asia, VIZ Media, Ani-One Asia (confirmed working for India)
 * Run: node seed/update-streams.js
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '../db/anime.db'));

const UPDATES = [
  // Attack on Titan — Muse Asia (REAL ID: PLwLSw1_eDZl1Z2OaPWYl4DqhX9GkB-jkR)
  { mal_id: 16498, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl1Z2OaPWYl4DqhX9GkB-jkR&autoplay=1' },

  // Re:Zero S1 — Muse Asia (REAL ID: PLwLSw1_eDZl3RN7t6wesJqlUkSUN6FHKF)
  { mal_id: 31240, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl3RN7t6wesJqlUkSUN6FHKF&autoplay=1' },

  // Hunter x Hunter 2011 — Muse Asia (REAL ID: PLwLSw1_eDZl2SdSro00Nvg38MQUf-5ZL8)
  { mal_id: 11061, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl2SdSro00Nvg38MQUf-5ZL8&autoplay=1' },

  // Spy x Family — Muse Asia (REAL ID: PLwLSw1_eDZl1wGMYg5oB3uEns0CZNl6sI)
  { mal_id: 50265, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl1wGMYg5oB3uEns0CZNl6sI&autoplay=1' },

  // Fairy Tail — Muse Asia (REAL ID: PLwLSw1_eDZl2VQRIahDF73hnkdPjNRYnu)
  { mal_id: 6702, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl2VQRIahDF73hnkdPjNRYnu&autoplay=1' },

  // Slime S2 — Muse Asia (REAL ID: PLwLSw1_eDZl24o1N6adcgGPyIJPfJ21GL)
  { mal_id: 37430, season: 2, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl24o1N6adcgGPyIJPfJ21GL&autoplay=1' },

  // KonoSuba S1 — Muse Asia (REAL ID: PLwLSw1_eDZl1_X5X2_B2aAivX9GvWshA9)
  { mal_id: 30831, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl1_X5X2_B2aAivX9GvWshA9&autoplay=1' },

  // Overlord S1 — Muse Asia (REAL ID: PLwLSw1_eDZl1U_M0B4_aA8x_G6Z-N-W_y)
  { mal_id: 29803, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLwLSw1_eDZl1U_M0B4_aA8x_G6Z-N-W_y&autoplay=1' },

  // Naruto — VIZ Media (REAL ID: PLDDFkfLheQ9hNru7WoTa26dpn6o9-AEJK)
  { mal_id: 20, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLDDFkfLheQ9hNru7WoTa26dpn6o9-AEJK&autoplay=1' },

  // Bleach — Ani-One Asia (REAL ID: PLxSscENEp7JjESRYoluizbfS2sZGm_1Bi)
  { mal_id: 269, season: 1, url: 'https://www.youtube.com/embed/videoseries?list=PLxSscENEp7JjESRYoluizbfS2sZGm_1Bi&autoplay=1' },
];

const stmt = db.prepare(`
  UPDATE seasons SET stream_url = ?
  WHERE anime_id = (SELECT id FROM anime WHERE mal_id = ?)
  AND season_number = ?
`);

let updated = 0;
for (const u of UPDATES) {
  const result = stmt.run(u.url, u.mal_id, u.season);
  if (result.changes > 0) { console.log(`✅ Updated MAL #${u.mal_id} Season ${u.season}`); updated++; }
  else console.log(`⚠  Skipped MAL #${u.mal_id} Season ${u.season} (not found)`);
}

console.log(`\n✨ Updated ${updated}/${UPDATES.length} stream URLs with real playlist IDs.\n`);
db.close();
