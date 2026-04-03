/* Anime detail page logic */
document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = '/browse.html'; return; }

  try {
    const anime = await api.getAnime(id);
    const genres = Array.isArray(anime.genres) ? anime.genres : [];

    // Banner
    const banner = document.getElementById('anime-banner');
    if (banner) banner.style.backgroundImage = `url('${anime.banner_image || anime.cover_image}')`;

    document.getElementById('anime-cover').src = anime.cover_image;
    document.getElementById('anime-cover').alt = anime.title;
    document.getElementById('anime-title').textContent = anime.title_english || anime.title;
    document.getElementById('anime-title-jp').textContent = anime.title;
    document.getElementById('anime-rating').textContent = `⭐ ${anime.rating?.toFixed(1) || 'N/A'}`;
    document.getElementById('anime-year').textContent = anime.year || 'Unknown';
    document.getElementById('anime-type').textContent = anime.type || 'TV';
    document.getElementById('anime-status').textContent = anime.status || 'Unknown';
    document.getElementById('anime-episodes').textContent = anime.episodes_count || '?';
    document.getElementById('anime-synopsis').textContent = anime.synopsis || 'No synopsis available.';
    document.getElementById('anime-genres').innerHTML =
      genres.map(g => `<a class="genre-tag" href="/browse.html?genre=${encodeURIComponent(g)}">${g}</a>`).join('');
    document.title = `${anime.title_english || anime.title} — AniStream`;

    // Watch button (goes to first season)
    const watchBtn = document.getElementById('watch-btn');
    if (watchBtn && anime.seasons?.length) {
      watchBtn.href = `/watch.html?id=${id}&season=1`;
      watchBtn.style.display = '';
    }

    // Watchlist button
    const wlBtn = document.getElementById('watchlist-btn');
    if (wlBtn) {
      if (auth.isLoggedIn()) {
        try {
          const { inWatchlist } = await api.checkWatchlist(id);
          updateWLBtn(wlBtn, inWatchlist);
        } catch {}
        wlBtn.addEventListener('click', async () => {
          if (!auth.isLoggedIn()) { location.href = '/login.html'; return; }
          const isIn = wlBtn.dataset.in === '1';
          try {
            if (isIn) await api.removeWatchlist(id);
            else await api.addWatchlist(id);
            updateWLBtn(wlBtn, !isIn);
          } catch (e) { alert(e.message); }
        });
      } else {
        wlBtn.textContent = '+ Add to Watchlist';
        wlBtn.addEventListener('click', () => { location.href = '/login.html'; });
      }
    }

    function updateWLBtn(btn, inList) {
      btn.dataset.in = inList ? '1' : '0';
      btn.textContent = inList ? '✓ In Watchlist' : '+ Add to Watchlist';
      btn.classList.toggle('btn-active', inList);
    }

    // Seasons & episodes
    const seasonsContainer = document.getElementById('seasons-container');
    if (seasonsContainer && anime.seasons?.length) {
      seasonsContainer.innerHTML = anime.seasons.map((s, i) => `
        <div class="season-block">
          <div class="season-header">
            <h3>${s.title || `Season ${s.season_number}`}</h3>
            <span class="ep-count">${s.episode_count || '?'} Episodes</span>
          </div>
          <a class="watch-season-btn" href="/watch.html?id=${id}&season=${s.season_number}">
            ▶ Watch ${s.title || `Season ${s.season_number}`}
          </a>
        </div>`).join('');
    } else if (seasonsContainer) {
      seasonsContainer.innerHTML = '<p class="no-seasons">No episodes available yet.</p>';
    }

    document.getElementById('loading')?.remove();
    document.getElementById('anime-content')?.style.setProperty('display', 'block');

  } catch (err) {
    console.error(err);
    document.getElementById('loading').innerHTML = `<p class="error-msg">Anime not found. <a href="/browse.html">Browse all anime</a></p>`;
  }
});
