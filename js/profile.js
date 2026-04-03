/* Profile page */
document.addEventListener('DOMContentLoaded', async () => {
  if (!auth.requireLogin()) return;

  const user = auth.getUser();
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-avatar').textContent = user.username?.charAt(0).toUpperCase();
  document.title = `${user.username}'s Profile — AniStream`;

  document.getElementById('logout-btn')?.addEventListener('click', () => auth.logout());

  function buildCard(anime) {
    const genres = Array.isArray(anime.genres) ? anime.genres : [];
    return `
      <a class="anime-card" href="/anime.html?id=${anime.id}">
        <div class="card-poster">
          <img src="${anime.cover_image}" alt="${anime.title}" loading="lazy">
          <div class="card-overlay"><span class="play-btn">▶</span></div>
          <span class="card-rating">⭐ ${anime.rating?.toFixed(1) || '?'}</span>
        </div>
        <div class="card-info">
          <p class="card-title">${anime.title_english || anime.title}</p>
          <div class="card-genres">${genres.slice(0,2).map(g=>`<span>${g}</span>`).join('')}</div>
        </div>
      </a>`;
  }

  try {
    const [watchlist, history] = await Promise.all([api.getWatchlist(), api.getHistory()]);

    document.getElementById('watchlist-count').textContent = watchlist.length;
    document.getElementById('history-count').textContent = history.length;

    const wlGrid = document.getElementById('watchlist-grid');
    wlGrid.innerHTML = watchlist.length
      ? watchlist.map(buildCard).join('')
      : '<p class="empty-msg">Your watchlist is empty. <a href="/browse.html">Browse anime</a></p>';

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = history.length
      ? history.map(h => `
          <a class="history-item" href="/watch.html?id=${h.anime_id}&season=${h.season_number}">
            <img src="${h.cover_image}" alt="${h.title}" class="history-thumb">
            <div class="history-info">
              <p class="history-title">${h.title_english || h.title}</p>
              <p class="history-meta">Season ${h.season_number} · ${new Date(h.watched_at).toLocaleDateString()}</p>
            </div>
            <span class="history-play">▶ Continue</span>
          </a>`).join('')
      : '<p class="empty-msg">No watch history yet.</p>';

  } catch (err) {
    console.error(err);
  }
});
